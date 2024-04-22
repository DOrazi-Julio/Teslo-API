import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed.data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async runSeed() {
    await this.deleteTables();
    const firstUser = await this.insertUsers();
    this.insertNewProducts(firstUser);
    return 'Seed executed';
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      user.password = bcrypt.hashSync(user.password, 10),
      users.push(this.userRepository.create(user));
    });

   const dbUsers =  await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }

  private async insertNewProducts(firstUser: User) {
    const resp = await this.productService.deleteAllProducts();
    const products = initialData.products;

    let insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, firstUser));
    });

    const result = await Promise.all(insertPromises);

    return true;
  }
}
