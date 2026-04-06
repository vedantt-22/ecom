import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from "typeorm";
import { Cart } from "./Cart";
import { Order } from "./Order";
import { PasswordResetCode } from "./PasswordResetCode";

// 1. Define the roles as a Type (or Enum)
export type UserRole = "customer" | "admin" | "guest";

// 2. Extend Express to recognize your User structure
declare global {
  namespace Express {
    interface User {
      id: number;
      role: UserRole; // This must match the type above
      name: string;
    }
  }
}

@Entity("users")
@Index(["email"])          // looked up on every login
@Index(["role"])  
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({
    type: "varchar",
    length: 50,
    default: "customer",
  })
  role!: UserRole;

  @Column({ default: false })
  isLocked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;  

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  cart!: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => PasswordResetCode, (code) => code.user)
  passwordResetCodes!: PasswordResetCode[];
}