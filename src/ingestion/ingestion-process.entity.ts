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

  @ManyToOne(() => Document, { nullable: false })
  document: Document;

  @Column({ default: "pending" })
  status: string;

  @Column({ nullable: true })
  error: string;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
