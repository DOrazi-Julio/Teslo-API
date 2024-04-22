import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsUtils, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const { images = [], ...productDetails } = createProductDto;
    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user:user
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDbException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });
      return products.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      }));
    } catch (error) {
      this.handleDbException(error);
    }
  }

  async findOne(searchTerm: string) {
    let product: Product;

    if (isUUID(searchTerm)) {
      product = await this.productRepository.findOneBy({ id: searchTerm });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug=:slug`, {
          title: searchTerm.toUpperCase(),
          slug: searchTerm.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product ${searchTerm} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto,user:User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) throw new NotFoundException(`Product ${id} not found`);

    // Si vienen imágenes debemos eliminar las actuales primero ( lo hacemos con Query runner )
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        // Aquí borramos las anteriores
        await queryRunner.manager.delete(ProductImage, {
          product: { id: product.id },
        });
        // Ahora agregamos las nuevas
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      product.user = user
      await queryRunner.manager.save(product);

      // ahora aplicamos los cambios

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOne(id);
    } catch (error) {
      console.log(error);

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDbException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDbException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected server error check console logs',
    );
  }
  /**
   * Este servicio debería ser controlado para que solo se pueda utilizar en desarrollo.
   * Elimina toda la bd y se usa para la seed (inicializaron de la bd durante el desarrollo)
   * @returns
   */
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbException(error);
    }
  }
}
