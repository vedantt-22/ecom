import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity("order_items")
export class OrderItem {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  priceAtPurchase!: number;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: "RESTRICT",
    eager: true,
  })
  @JoinColumn({ name: "productId" })
  product!: Product;
}