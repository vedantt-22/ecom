import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn
} from "typeorm";
import { User } from "./User";

@Entity("password_reset_codes")
export class PasswordResetCode {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 6 })
  code!: string;

  @Column({ type: "datetime" })
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.passwordResetCodes, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;
}