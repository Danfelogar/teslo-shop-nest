import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertNewUser();
    await this.insertNewProduct(adminUser);
    return `seed executed`;
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUser() {
    const seedUsers = initialData.users;

    const users: User[] = [];
    //solo se crea un arreglo de usuarios
    seedUsers.forEach((user) => {
      users.push(
        this.userRepository.create({
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        }),
      );
    });
    //salvaguarda la data de usuarios en la base de datos
    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async insertNewProduct(user: User) {
    this.productsService.deleteAllProducts();
    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });
    //ejecuta el arreglo de promesas si se resuelven todas bien sigue adelante
    await Promise.all(insertPromises);

    return true;
  }
}
