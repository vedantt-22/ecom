import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";
import { Address } from "./Address";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "cash_on_delivery"
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

  @Column({ type: "float" }) 
  totalAmount!: number;

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

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  @Index()
  userId!: number; 

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ nullable: true })
  shippingAddressId!: number | null;

  @ManyToOne(() => Address, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "shippingAddressId" })
  shippingAddress!: Address | null;

  @OneToMany(() => OrderItem, (item) => item.order, { 
    cascade: ["insert", "update"] 
  })
  items!: OrderItem[];
}