import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { DocumentsModule } from "./documents/documents.module";
import { IngestionModule } from "./ingestion/ingestion.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
    DatabaseModule,
  ],
})
export class AppModule {}
