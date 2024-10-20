import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

//decorador para definir que esta clase es una entidad o tabla en la base de datos
@Entity('users')
export class User {
  //llave primaria
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    //esto es para que no se devuelva la contraseña en las respuestas
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];
  // de uno a muchos un usuario puede tener muchos productos
  @OneToMany(
    //la primera parte de la relación necesita la otra entidad(otras palabras a la tabla que quiero apuntar)
    () => Product,
    //se necesita una instancia(en este caso de product) para decir como se relaciona el producto con esta tabla(para el momento que se crear user todavía no debería existir en product hasta completar el @ManyToOne)
    (product) => product.user,
  )
  product: Product;

  //triggers para antes de insertar o actualizar
  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
