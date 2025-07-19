import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { Document } from "../documents/document.entity";
import { IngestionProcess } from "../ingestion/ingestion-process.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "saikatbishal",
      database: process.env.DB_NAME || "nestjs_docs",
      entities: [User, Document, IngestionProcess],
      synchronize: true, // Set to false in production, use migrations instead
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([User, Document, IngestionProcess]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
