import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.insertNewProduct();

    return `seed executed`;
  }

  private async insertNewProduct() {
    this.productsService.deleteAllProducts();
    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product));
    });
    //ejecuta el arreglo de promesas si se resuelven todas bien sigue adelante
    await Promise.all(insertPromises);

    return true;
  }
}
