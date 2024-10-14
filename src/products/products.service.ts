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
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  //el logger sirve para hacer logs en la consola de forma mas ordenada, se especifica el nombre del archivo en el que se esta trabajando
  private readonly logger = new Logger('ProductsService');

  constructor(
    //InjectRepository se encarga de inyectar el repositorio de la entidad que se le pase como parámetro, para hacer query builders y poder interactuar con la base de datos
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
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

      //esto crea la instancia del producto con usus propiedades mas no lo guarda en la base de datos
      const product = this.productRepository.create(createProductDto);

      //esto guarda el producto en la base de datos
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //TODO: Paginar los productos
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      //con esto se logra que se busque el producto por el titulo o por el slug como si se tratara de una query de sql normal evitando la injection de dependencias y lo hacemos case insensitive al colocar el titulo en mayusculas con el UPPER
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
      // `select * from Products where slug='XX' or title=xxx`
    }

    // const product = await this.productRepository.findOneBy({ term });

    if (!product)
      throw new NotFoundException(`Product with term ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productRepository.save(product);
      return `Product successfully updated`;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

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
}
