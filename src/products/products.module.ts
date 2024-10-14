// toda la carpeta products se creo con el comando "nest g res products --no-spec"
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    // con esto se logra que typeorm busque las entidades en el proyecto y sincronice la base de datos con las entidades
    TypeOrmModule.forFeature([Product]),
  ],
})
export class ProductsModule {}
