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
import { Address } from "./Address"; 

export type UserRole = "customer" | "admin" | "guest";

declare global {
  namespace Express {
    interface User {
      id: number;
      role: UserRole;
      name: string;
    }
  }
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Index({ unique: true }) // Indexing email is good, unique constraint is vital
  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ select: false }) 
  passwordHash!: string;

  @Index() 
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

  // --- Relationships ---

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  cart!: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => PasswordResetCode, (code) => code.user)
  passwordResetCodes!: PasswordResetCode[];

  // ADDED: Inverse relationship for Addresses
  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];
}