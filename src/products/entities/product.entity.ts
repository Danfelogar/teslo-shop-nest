import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

//este decorador se usa para que typeorm sepa que esta clase es una entidad para la base de datos
@Entity()
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
  //imgs

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
