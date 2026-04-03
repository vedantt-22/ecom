import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Category } from "./Category";

@Entity("product_types")
export class ProductType {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 100 })
  name!: string;

  @OneToMany(() => Category, (category) => category.type)
  categories!: Category[];
}