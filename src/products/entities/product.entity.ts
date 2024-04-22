import { text } from 'stream/consumers';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name:"products"
})

export class Product {
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    uniqueItems:true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ApiProperty()
  @Column('text', { unique: true })
  title: string;
  @ApiProperty()
  @Column('float', {
    default: 0,
  })
  price: number;
  @ApiProperty()
  @Column({
    type: 'text', // Otro ejemplo de como se puede especificar el tipo de dato en la bd
    nullable: true,
  })
  description: string;
  @ApiProperty()
  @Column({
    type: 'text',
    unique: true,
  })
   @ApiProperty() slug: string;
  @Column({
    type: 'int',
    default: 0,
  })
   @ApiProperty() stock: number;
  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];
  @ApiProperty()
  @Column({
    type: 'text',
  })
  gender: string;
  @ApiProperty()
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImage, (ProductImage) => ProductImage.product, {
    cascade: true,
    eager:true
  })
  images?: ProductImage[];

  @ManyToOne(
    ()=> User,
    (user)=>user.product,
    {eager:true}
  )
  user:User

  @BeforeUpdate()
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
