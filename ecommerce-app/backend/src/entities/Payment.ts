import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn, CreateDateColumn,
} from "typeorm";
import { Order } from "./Order";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

@Entity("payments")
export class Payment {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({ length: 50 })
  method!: string;

  @Column({
    type:    "varchar",
    length:  20,
    default: "pending",
  })
  status!: PaymentStatus;

  // In a real payment gateway, this would be the
  // gateway's transaction reference ID.
  // In our mock, we generate a fake one.
  @Column({ length: 100, nullable: true })
  transactionId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Order, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @Column()
  orderId!: number;
}