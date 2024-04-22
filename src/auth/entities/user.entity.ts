import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ValidRoles } from '../interfaces';

@Entity('users')
export class User {
  @ApiProperty({
    example: '00ea0d5f-42e5-4360-9602-5cec98c206e9',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  @ApiProperty()
  email: string;

  @Column({
    type: 'text',
    select: false,
  })
  @ApiProperty()
  password: string;

  @Column({
    type: 'text',
  })
  @ApiProperty()
  fullName: string;

  @Column({
    type: 'bool',
    default: true,
  })
  @ApiProperty()
  isActvie: boolean;

  @Column({
    type: 'text',
    array: true,
    default: ['user'],
  })
  @ApiProperty({
    enum:[ValidRoles]
  })
  role: string[];

  @OneToMany(() => Product, (product) => product.user)
  @ApiProperty()
  product: Product;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
