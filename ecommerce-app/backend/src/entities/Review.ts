import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
  Check,
} from "typeorm";
import { User }    from "./User";
import { Product } from "./Product";

@Entity("reviews")
@Check(`"rating" >= 1 AND "rating" <= 5`)  // DB-level constraint
export class Review {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  rating!: number;              // 1-5

  @Column({ type: "text" })
  comment!: string;

  // Whether the reviewer has actually purchased this product.
  // Set by the service — not by the user.
  @Column({ default: false })
  isVerifiedPurchase!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "CASCADE",
    eager:    true,
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column()
  productId!: number;
}