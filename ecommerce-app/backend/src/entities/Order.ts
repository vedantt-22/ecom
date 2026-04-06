import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn, CreateDateColumn,
  Index
} from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "pay_on_delivery"
  | "bank_transfer";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

@Entity("orders")
@Index(["createdAt"])
export class Order {

  @PrimaryGeneratedColumn()
  id!: number;

  // Changed to 'simple-float' or 'float' for better SQLite compatibility
  @Column({ type: "float" }) 
  totalAmount!: number;

  // Changed from 'enum' to 'varchar' (or 'simple-enum')
  // We use the TypeScript type for intellisense, but DB stores it as a string
  @Column({
    type: "varchar",
    length: 50,
    default: "cash_on_delivery"
  })
  paymentMethod!: PaymentMethod;

  @Column({
    type: "varchar",
    length: 50,
    default: "pending"
  })
  status!: OrderStatus;

  @CreateDateColumn()
  createdAt!: Date;


  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];
}