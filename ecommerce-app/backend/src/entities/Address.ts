import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, default: "Home" })
  label!: string; 

  @Column({ length: 100 })
  fullName!: string;

  @Column({ length: 15 })
  phone!: string;

  @Column({ length: 255 })
  addressLine1!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  addressLine2!: string | null;

  @Column({ length: 100 })
  city!: string;

  @Column({ length: 100 })
  state!: string;

  @Column({ length: 10 })
  pincode!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  // Added UpdateDateColumn to track when an address was last modified
  @UpdateDateColumn()
  updatedAt!: Date;

  // Added Index for faster lookups by user
  @Index()
  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.addresses, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;
}