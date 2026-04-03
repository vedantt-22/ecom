import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity("cart_items")
export class CartItem {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "cartId" })
  cart!: Cart;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "productId" })
  product!: Product;
}