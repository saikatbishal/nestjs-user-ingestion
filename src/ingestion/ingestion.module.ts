import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IngestionService } from "./ingestion.service";
import { IngestionController } from "./ingestion.controller";
import { IngestionProcess } from "./ingestion-process.entity";

@Module({
  imports: [TypeOrmModule.forFeature([IngestionProcess])],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
