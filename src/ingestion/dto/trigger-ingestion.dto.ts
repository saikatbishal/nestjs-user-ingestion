import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";

export enum IngestionType {
  FULL = "full_ingestion",
  INCREMENTAL = "incremental_ingestion",
  DOCUMENT_SPECIFIC = "document_specific",
}

export class TriggerIngestionDto {
  @IsArray()
  @IsOptional()
  documentIds?: number[];

  @IsEnum(IngestionType)
  type: IngestionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  parameters?: Record<string, any>;
}
