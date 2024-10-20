import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// tomamos el PartialType de swagger para que el dto sea parcial y la documentación de swagger los deje como opcionales
export class UpdateProductDto extends PartialType(CreateProductDto) {}
