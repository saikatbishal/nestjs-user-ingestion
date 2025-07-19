import { DataSource } from "typeorm";
import { User } from "../users/user.entity";
import { Document } from "../documents/document.entity";
import { IngestionProcess } from "../ingestion/ingestion-process.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "saikatbishal",
  database: process.env.DB_NAME || "nestjs_docs",
  entities: [User, Document, IngestionProcess],
  synchronize: false, // Use migrations in production
});

export const databaseProviders = [
  {
    provide: "DATA_SOURCE",
    useFactory: async () => {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      return AppDataSource;
    },
  },
];
