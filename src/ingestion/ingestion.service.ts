import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IngestionProcess } from "./ingestion-process.entity";
import {
  TriggerIngestionDto,
  IngestionType,
} from "./dto/trigger-ingestion.dto";

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(IngestionProcess)
    private ingestionRepository: Repository<IngestionProcess>
  ) {}

  async triggerIngestion(dto: TriggerIngestionDto): Promise<IngestionProcess> {
    this.logger.log(`Triggering ingestion: ${dto.type}`);

    const process = this.ingestionRepository.create({
      type: dto.type,
      status: "pending",
      documentIds: dto.documentIds || [],
      description: dto.description,
      parameters: dto.parameters || {},
      startedAt: new Date(),
    });

    const savedProcess = await this.ingestionRepository.save(process);

    // Simulate ingestion process (in real app, this would trigger actual processing)
    this.processIngestion(savedProcess.id);

    return savedProcess;
  }

  async getAllProcesses(): Promise<IngestionProcess[]> {
    return this.ingestionRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async getProcessById(id: number): Promise<IngestionProcess> {
    const process = await this.ingestionRepository.findOne({ where: { id } });

    if (!process) {
      throw new NotFoundException(`Ingestion process with ID ${id} not found`);
    }

    return process;
  }

  async handleWebhook(payload: any): Promise<{ message: string }> {
    this.logger.log("Received webhook payload:", payload);

    // Handle different webhook types
    if (payload.type === "ingestion_complete") {
      await this.updateProcessStatus(payload.processId, "completed");
    } else if (payload.type === "ingestion_failed") {
      await this.updateProcessStatus(
        payload.processId,
        "failed",
        payload.error
      );
    }

    return { message: "Webhook processed successfully" };
  }

  private async updateProcessStatus(
    processId: number,
    status: string,
    error?: string
  ): Promise<void> {
    const process = await this.getProcessById(processId);
    process.status = status;
    process.completedAt = new Date();

    if (error) {
      process.error = error;
    }

    await this.ingestionRepository.save(process);
  }

  private async processIngestion(processId: number): Promise<void> {
    // Simulate async processing
    setTimeout(async () => {
      try {
        const process = await this.getProcessById(processId);
        process.status = "running";
        await this.ingestionRepository.save(process);

        // Simulate processing time
        setTimeout(async () => {
          process.status = "completed";
          process.completedAt = new Date();
          await this.ingestionRepository.save(process);
          this.logger.log(`Ingestion process ${processId} completed`);
        }, 5000); // 5 seconds processing time
      } catch (error) {
        this.logger.error(`Ingestion process ${processId} failed:`, error);
        await this.updateProcessStatus(processId, "failed", error.message);
      }
    }, 1000); // 1 second delay before starting
  }
}
