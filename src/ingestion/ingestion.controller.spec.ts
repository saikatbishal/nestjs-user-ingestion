import { Test, TestingModule } from "@nestjs/testing";
import { IngestionController } from "./ingestion.controller";
import { IngestionService } from "./ingestion.service";
import {
  TriggerIngestionDto,
  IngestionType,
} from "./dto/trigger-ingestion.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";

describe("IngestionController", () => {
  let controller: IngestionController;
  let mockIngestionService: Partial<IngestionService>;
  let mockJwtAuthGuard: any;
  let mockRolesGuard: any;

  const mockIngestionProcess = {
    id: 1,
    type: "full" as IngestionType,
    status: "pending",
    documentIds: [],
    description: "Test ingestion",
    parameters: {},
    startedAt: new Date(),
    completedAt: null,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockIngestionService = {
      triggerIngestion: jest.fn(),
      getAllProcesses: jest.fn(),
      getProcessById: jest.fn(),
      handleWebhook: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    mockRolesGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        { provide: IngestionService, useValue: mockIngestionService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<IngestionController>(IngestionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("triggerIngestion", () => {
    it("should trigger ingestion process", async () => {
      const dto: TriggerIngestionDto = {
        type: IngestionType.FULL,
        description: "Full ingestion test",
      };

      (mockIngestionService.triggerIngestion as jest.Mock).mockResolvedValue(
        mockIngestionProcess
      );

      const result = await controller.triggerIngestion(dto);

      expect(mockIngestionService.triggerIngestion).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockIngestionProcess);
    });

    it("should handle service errors", async () => {
      const dto: TriggerIngestionDto = {
        type: IngestionType.INCREMENTAL,
      };

      const error = new Error("Trigger failed");
      (mockIngestionService.triggerIngestion as jest.Mock).mockRejectedValue(
        error
      );

      await expect(controller.triggerIngestion(dto)).rejects.toThrow(
        "Trigger failed"
      );
    });
  });

  describe("getIngestionProcesses", () => {
    it("should return all ingestion processes", async () => {
      const processes = [mockIngestionProcess];
      (mockIngestionService.getAllProcesses as jest.Mock).mockResolvedValue(
        processes
      );

      const result = await controller.getIngestionProcesses();

      expect(mockIngestionService.getAllProcesses).toHaveBeenCalled();
      expect(result).toEqual(processes);
    });

    it("should handle service errors", async () => {
      const error = new Error("Get all failed");
      (mockIngestionService.getAllProcesses as jest.Mock).mockRejectedValue(
        error
      );

      await expect(controller.getIngestionProcesses()).rejects.toThrow(
        "Get all failed"
      );
    });
  });

  describe("getIngestionProcess", () => {
    it("should return ingestion process by id", async () => {
      (mockIngestionService.getProcessById as jest.Mock).mockResolvedValue(
        mockIngestionProcess
      );

      const result = await controller.getIngestionProcess(1);

      expect(mockIngestionService.getProcessById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockIngestionProcess);
    });

    it("should handle service errors", async () => {
      const error = new Error("Process not found");
      (mockIngestionService.getProcessById as jest.Mock).mockRejectedValue(
        error
      );

      await expect(controller.getIngestionProcess(1)).rejects.toThrow(
        "Process not found"
      );
    });
  });

  describe("handleWebhook", () => {
    it("should handle webhook payload", async () => {
      const payload = {
        type: "ingestion_complete",
        processId: 1,
      };

      const response = { message: "Webhook processed successfully" };
      (mockIngestionService.handleWebhook as jest.Mock).mockResolvedValue(
        response
      );

      const result = await controller.handleWebhook(payload);

      expect(mockIngestionService.handleWebhook).toHaveBeenCalledWith(payload);
      expect(result).toEqual(response);
    });

    it("should handle webhook errors", async () => {
      const payload = {
        type: "ingestion_failed",
        processId: 1,
        error: "Processing failed",
      };

      const error = new Error("Webhook failed");
      (mockIngestionService.handleWebhook as jest.Mock).mockRejectedValue(
        error
      );

      await expect(controller.handleWebhook(payload)).rejects.toThrow(
        "Webhook failed"
      );
    });
  });
});
