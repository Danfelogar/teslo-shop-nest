import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({
  name: 'product_images',
})
export class ProductImage {
  //al dejar el decorador @PrimaryGeneratedColumn() sin argumentos, se asume que la columna es de tipo integer y autoincremental
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  //esto indica que no es una columna sino que se trata de una relación con la entidad Product de uno a lo que indica que imagen tendrá un solo producto asociado
  @ManyToOne(
    //este callback indica la entidad de donde viene la relación
    () => Product,
    //este callback indica la columna que se usara para la relación
    (product) => product.images,
    //si se borra el producto quiero que se borren las imagenes asociadas a el
    { onDelete: 'CASCADE' },
  )
  product: Product;
}
