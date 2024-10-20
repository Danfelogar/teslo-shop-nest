import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities';

@Injectable()
export class ProductsService {
  //el logger sirve para hacer logs en la consola de forma mas ordenada, se especifica el nombre del archivo en el que se esta trabajando
  private readonly logger = new Logger('ProductsService');

  constructor(
    //InjectRepository se encarga de inyectar el repositorio de la entidad que se le pase como parámetro, para hacer query builders y poder interactuar con la base de datos
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    //se crea una nueva instancia del repositorio de la entidad ProductImage
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    // esta instancia conoce el usuario que uso, la cadena de conexión de la base de datos y el nombre de la base de datos
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      //se recomienda usar esta logica o reutilizarla en productos.entity.ts
      // if (!createProductDto.slug) {
      //   createProductDto.slug = createProductDto.title
      //     .toLowerCase()
      //     .replaceAll(/ /g, '-')
      //     .replaceAll(" ' ", '');
      // } else {
      //   createProductDto.slug = createProductDto.slug
      //     .toLowerCase()
      //     .replaceAll(/ /g, '-')
      //     .replaceAll(" ' ", '');
      // }

      const { images = [], ...productDetails } = createProductDto;

      //esto crea la instancia del producto con sus propiedades mas no lo guarda en la base de datos
      const product = this.productRepository.create({
        ...productDetails,
        //typeorm infiere que se quiere crear instancias de ProductImage con las urls de las imagenes y le asignara automaticamente el id del producto al que pertenecen en este caso el que se esta creando en estos momentos
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user,
      });

      //esto guarda el producto en la base de datos
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //TODO: Paginar los productos
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
      //con esta relación lo que se espera es que se traigan las imagenes asociadas a los productos
      relations: {
        images: true,
      },
    });

    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //el alias es necesario para poder hacer el left join con la tabla de imagenes
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      //con esto se logra que se busque el producto por el titulo o por el slug como si se tratara de una query de sql normal evitando la injection de dependencias y lo hacemos case insensitive al colocar el titulo en mayusculas con el UPPER
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        //importante usar esto para especificar la relación que se quiere traer y en caso no se tuvieran ninguna entidad o registro traería un array vació y se especifica el prod.images para que se traigan las imagenes asociadas a los productos y las asigne a esa columna y se pide otro alias en caso tal se quiera hacer otro left join pero no es necesario para este ejercicio
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
      // `select * from Products where slug='XX' or title=xxx`
    }

    // const product = await this.productRepository.findOneBy({ term });

    if (!product)
      throw new NotFoundException(`Product with term ${term} not found`);

    // con esto me aseguro de regresar la entidad y en otra función lo aplanamos
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    //preload del producto
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    //create query runner: esto sirve para hacer una serie de procedimientos o commits en la base de datos y si algo falla se hace un rollback y nos debe de lanzar un error al usuario
    const queryRunner = this.dataSource.createQueryRunner();
    //con esto se inicia la transacción en la base de datos y se espera a que se conecte
    await queryRunner.connect();
    //con esto se inicia la transacción
    await queryRunner.startTransaction();

    try {
      //si vienen las imgs quiero borrar todas las imágenes y poner las que vienen nuevas
      if (images) {
        // se borran todas las imágenes asociadas al producto recuerda que el softDelete es un borrado lógico y no físico como el delete
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        //esta linea no impacta la base de datos pero se encarga de instanciar las imágenes con las urls que vienen en el updateProductDto
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      } else {
        //si no vienen imágenes se dejan las que ya estaban haciendo una consulta a la base de datos
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      }
      //se actualiza el producto con el usuario que lo esta actualizando
      product.user = user;
      // se intenta guardar el producto con las imágenes (queryRunner.manager no impacta la base de datos)
      await queryRunner.manager.save(product);

      //si no da errores hasta este punto se hace commit
      await queryRunner.commitTransaction();
      // se libera el queryRunner
      await queryRunner.release();

      // await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {
      //si algo falla se hace rollback
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    //se actualiza la dependencia en el entities de product-images con un delete en cascada para que se borren las imágenes asociadas al producto al ser las imgs una tabla muy simple
    await this.productRepository.remove(product);

    return `Product with id ${id} removed`;
  }

  private handleDBExceptions(error: any) {
    this.logger.error({ error });

    if (error.code === '23505')
      throw new InternalServerErrorException(error.detail);

    throw new InternalServerErrorException(
      'Unexpected error, check services logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      //se seleccionan todos los productos y se borran
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
