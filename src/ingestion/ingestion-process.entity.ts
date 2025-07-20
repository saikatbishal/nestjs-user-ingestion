import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Document } from "../documents/document.entity";

@Entity()
export class IngestionProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ default: "pending" })
  status: string;

  @Column("simple-array", { nullable: true })
  documentIds: number[];

  @Column({ nullable: true })
  description: string;

  @Column("json", { nullable: true })
  parameters: Record<string, any>;

  @Column({ nullable: true })
  error: string;

  @ManyToOne(() => Document, { nullable: true, onDelete: "SET NULL" })
  document: Document;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
