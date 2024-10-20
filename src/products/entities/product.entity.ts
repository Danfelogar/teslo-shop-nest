import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-images.entity';
import { User } from 'src/auth/entities';

//este decorador se usa para que typeorm sepa que esta clase es una entidad para la base de datos
@Entity({
  //esta key se usa para llamar la tabla de esta forma en la base de datos
  name: 'products',
})
export class Product {
  //este decorador se usa para que typeorm sepa que este campo es la llave primaria de la tabla
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //este decorador se usa para que typeorm sepa que este campo es una columna de la tabla
  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0,
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(
    // este callback se usa para que typeorm sepa que la relación es de uno a muchos y en este caso la relación es con la entidad ProductImage
    () => ProductImage,
    //este callback es para que sean que productImage.product sea igual a product
    (productImage) => productImage.product,
    //este objeto indica que cascade es true, lo que significa que si se elimina un producto, se eliminarán todas las imágenes asociadas a ese producto
    {
      cascade: true,
      //especificar el eager en true es para poder usar cualquier método find y que las imágenes se carguen automáticamente
      eager: true,
    },
  )
  images?: ProductImage[];

  @ManyToOne(
    //tabla a la que se apunta
    () => User,
    // propiedad de la tabla User que se relaciona con esta tabla
    (user) => user.product,
    // eager en true para que se cargue automáticamente el usuario cuando se busque un producto
    { eager: true },
  )
  user: User;

  @BeforeInsert()
  //esta función ayuda a que el slug se genere automaticamente si no se le pasa uno para el create
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(/ /g, '_')
      .replaceAll(" ' ", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(/ /g, '_')
      .replaceAll(" ' ", '');
  }
}
