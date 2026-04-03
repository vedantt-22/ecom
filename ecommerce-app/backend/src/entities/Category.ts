import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from "typeorm";
import { ProductType } from "./ProductType";
import { SubCategory } from "./SubCategory";

@Entity("categories")
export class Category {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @ManyToOne(() => ProductType, (type) => type.categories, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "typeId" })
  type!: ProductType;

  @OneToMany(() => SubCategory, (sub) => sub.category)
  subCategories!: SubCategory[];
}