import { Test, TestingModule } from "@nestjs/testing";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { ExecutionContext } from "@nestjs/common";

describe("DocumentsController", () => {
  let controller: DocumentsController;
  let mockDocumentsService: Partial<DocumentsService>;
  let mockJwtAuthGuard: any;
  let mockRolesGuard: any;

  const mockDocument = {
    id: 1,
    title: "Test Document",
    content: "Test content",
    type: "text",
    filePath: null,
    size: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockDocumentsService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upload: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    mockRolesGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        { provide: DocumentsService, useValue: mockDocumentsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllDocuments", () => {
    it("should return all documents", async () => {
      const documents = [mockDocument];
      (mockDocumentsService.findAll as jest.Mock).mockResolvedValue(documents);

      const result = await controller.getAllDocuments();

      expect(mockDocumentsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(documents);
    });

    it("should handle service errors", async () => {
      const error = new Error("Service error");
      (mockDocumentsService.findAll as jest.Mock).mockRejectedValue(error);

      await expect(controller.getAllDocuments()).rejects.toThrow(
        "Service error"
      );
    });
  });

  describe("getDocument", () => {
    it("should return a document by id", async () => {
      (mockDocumentsService.findById as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const result = await controller.getDocument(1);

      expect(mockDocumentsService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDocument);
    });

    it("should handle service errors", async () => {
      const error = new Error("Document not found");
      (mockDocumentsService.findById as jest.Mock).mockRejectedValue(error);

      await expect(controller.getDocument(1)).rejects.toThrow(
        "Document not found"
      );
    });
  });

  describe("createDocument", () => {
    it("should create a new document", async () => {
      const createDto: CreateDocumentDto = {
        title: "Test Document",
        content: "Test content",
      };

      (mockDocumentsService.create as jest.Mock).mockResolvedValue({
        ...mockDocument,
        ...createDto,
      });

      const result = await controller.createDocument(createDto);

      expect(mockDocumentsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({ ...mockDocument, ...createDto });
    });

    it("should handle service errors", async () => {
      const createDto: CreateDocumentDto = {
        title: "Test Document",
        content: "Test content",
      };
      const error = new Error("Creation failed");
      (mockDocumentsService.create as jest.Mock).mockRejectedValue(error);

      await expect(controller.createDocument(createDto)).rejects.toThrow(
        "Creation failed"
      );
    });
  });

  describe("updateDocument", () => {
    it("should update a document", async () => {
      const updateDto: UpdateDocumentDto = {
        title: "Updated Document",
      };

      const updatedDocument = { ...mockDocument, ...updateDto };
      (mockDocumentsService.update as jest.Mock).mockResolvedValue(
        updatedDocument
      );

      const result = await controller.updateDocument(1, updateDto);

      expect(mockDocumentsService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedDocument);
    });

    it("should handle service errors", async () => {
      const updateDto: UpdateDocumentDto = {
        title: "Updated Document",
      };
      const error = new Error("Update failed");
      (mockDocumentsService.update as jest.Mock).mockRejectedValue(error);

      await expect(controller.updateDocument(1, updateDto)).rejects.toThrow(
        "Update failed"
      );
    });
  });

  describe("deleteDocument", () => {
    it("should delete a document", async () => {
      (mockDocumentsService.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.deleteDocument(1);

      expect(mockDocumentsService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: "Document deleted successfully" });
    });

    it("should handle service errors", async () => {
      const error = new Error("Delete failed");
      (mockDocumentsService.delete as jest.Mock).mockRejectedValue(error);

      await expect(controller.deleteDocument(1)).rejects.toThrow(
        "Failed to delete document: Delete failed"
      );
    });
  });

  describe("uploadDocument", () => {
    it("should upload a file", async () => {
      const mockFile: Express.Multer.File = {
        originalname: "test.txt",
        mimetype: "text/plain",
        size: 100,
        buffer: Buffer.from("test content"),
        fieldname: "file",
        encoding: "utf-8",
        filename: "test.txt",
        destination: "./uploads",
        path: "./uploads/test.txt",
        stream: null,
      };

      const uploadedDocument = {
        ...mockDocument,
        title: "test.txt",
        type: "text/plain",
      };
      (mockDocumentsService.upload as jest.Mock).mockResolvedValue(
        uploadedDocument
      );

      const result = await controller.uploadDocument(mockFile);

      expect(mockDocumentsService.upload).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(uploadedDocument);
    });

    it("should handle upload errors", async () => {
      const mockFile: Express.Multer.File = {
        originalname: "test.txt",
        mimetype: "text/plain",
        size: 100,
        buffer: Buffer.from("test content"),
        fieldname: "file",
        encoding: "utf-8",
        filename: "test.txt",
        destination: "./uploads",
        path: "./uploads/test.txt",
        stream: null,
      };

      const error = new Error("Upload failed");
      (mockDocumentsService.upload as jest.Mock).mockRejectedValue(error);

      await expect(controller.uploadDocument(mockFile)).rejects.toThrow(
        "Upload failed"
      );
    });
  });
});
