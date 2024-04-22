import { text } from 'stream/consumers';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({
  name:"product_images"
})
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'text',
  })
  url: string;
  @ManyToOne(() => Product, (Product) => Product.images,{onDelete:'CASCADE'})
  product: Product;
}
