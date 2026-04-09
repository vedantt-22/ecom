import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
  Index
} from "typeorm";
import { SubCategory } from "./SubCategory";

@Entity("products")
@Index(["name"])  // for search optimization
@Index(["price"]) // for price range queries
@Index(["stock"]) // for stock availability queries


export class Product {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "int", default: 0 })
  stock!: number;

  @Column({ type: "text", length: 255, nullable: true })
  imagePath!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => SubCategory, (sub) => sub.products, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "subCategoryId" })
  subCategory!: SubCategory;
}