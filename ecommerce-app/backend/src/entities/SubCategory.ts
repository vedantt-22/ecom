import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from "typeorm";
import { Category } from "./Category";
import { Product } from "./Product";

@Entity("sub_categories")
export class SubCategory {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @ManyToOne(() => Category, (category) => category.subCategories, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "categoryId" })
  category!: Category;

  @OneToMany(() => Product, (product) => product.subCategory)
  products!: Product[];
}