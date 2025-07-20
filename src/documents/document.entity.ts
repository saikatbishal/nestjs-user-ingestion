import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text", { nullable: true })
  content: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ default: 0 })
  size: number;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
