import { Test, TestingModule } from "@nestjs/testing";
import { DocumentsService } from "./documents.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Document } from "./document.entity";
import { NotFoundException } from "@nestjs/common";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import * as fs from "fs";
import * as path from "path";

// Mock fs module
jest.mock("fs");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("DocumentsService", () => {
  let service: DocumentsService;
  let mockRepository: any;

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
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    // Reset fs mocks
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.unlinkSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("constructor", () => {
    it("should create upload directory if it doesn't exist", async () => {
      // Clear all mocks first to reset state
      jest.clearAllMocks();

      mockFs.existsSync.mockReturnValue(false);

      // Re-create the service to trigger constructor
      const newModule = await Test.createTestingModule({
        providers: [
          DocumentsService,
          { provide: getRepositoryToken(Document), useValue: mockRepository },
        ],
      }).compile();

      const newService = newModule.get<DocumentsService>(DocumentsService);

      expect(mockFs.existsSync).toHaveBeenCalledWith("./uploads");
      expect(mockFs.mkdirSync).toHaveBeenCalledWith("./uploads", {
        recursive: true,
      });
    });

    it("should not create upload directory if it already exists", async () => {
      // Reset mocks to test this specific scenario
      jest.clearAllMocks();
      mockFs.existsSync.mockReturnValue(true); // Directory already exists

      const newModule = await Test.createTestingModule({
        providers: [
          DocumentsService,
          {
            provide: getRepositoryToken(Document),
            useValue: mockRepository,
          },
        ],
      }).compile();

      const newService = newModule.get<DocumentsService>(DocumentsService);

      expect(mockFs.existsSync).toHaveBeenCalledWith("./uploads");
      expect(mockFs.mkdirSync).not.toHaveBeenCalled(); // Should not be called if directory exists
    });
  });

  describe("findAll", () => {
    it("should return all documents ordered by createdAt DESC", async () => {
      const documents = [mockDocument];
      mockRepository.find.mockResolvedValue(documents);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual(documents);
    });
  });

  describe("findById", () => {
    it("should return a document by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDocument);
    });

    it("should throw NotFoundException if document not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(
        new NotFoundException("Document with ID 1 not found")
      );
    });
  });

  describe("create", () => {
    it("should create a document with content", async () => {
      const createDto: CreateDocumentDto = {
        title: "Test Document",
        content: "Test content",
        type: "text",
      };

      const createdDocument = { ...createDto, size: 12 };
      mockRepository.create.mockReturnValue(createdDocument);
      mockRepository.save.mockResolvedValue({ ...createdDocument, id: 1 });

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: "Test Document",
        content: "Test content",
        type: "text",
        filePath: undefined,
        size: 12,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdDocument);
      expect(result).toEqual({ ...createdDocument, id: 1 });
    });

    it("should create a document with default type", async () => {
      const createDto: CreateDocumentDto = {
        title: "Test Document",
        content: "Test content",
      };

      const createdDocument = { ...createDto, type: "text", size: 12 };
      mockRepository.create.mockReturnValue(createdDocument);
      mockRepository.save.mockResolvedValue({ ...createdDocument, id: 1 });

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: "Test Document",
        content: "Test content",
        type: "text",
        filePath: undefined,
        size: 12,
      });
    });

    it("should create a document with filePath", async () => {
      const createDto: CreateDocumentDto = {
        title: "Test Document",
        content: "Test content",
        filePath: "/path/to/file",
      };

      const createdDocument = { ...createDto, type: "text", size: 12 };
      mockRepository.create.mockReturnValue(createdDocument);
      mockRepository.save.mockResolvedValue({ ...createdDocument, id: 1 });

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: "Test Document",
        content: "Test content",
        type: "text",
        filePath: "/path/to/file",
        size: 12,
      });
    });
  });

  describe("update", () => {
    it("should update a document", async () => {
      const updateDto: UpdateDocumentDto = {
        title: "Updated Document",
        content: "Updated content",
      };

      mockRepository.findOne.mockResolvedValue(mockDocument);
      const updatedDocument = { ...mockDocument, ...updateDto, size: 15 };
      mockRepository.save.mockResolvedValue(updatedDocument);

      const result = await service.update(1, updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockDocument,
        ...updateDto,
        size: 15,
      });
      expect(result).toEqual(updatedDocument);
    });

    it("should throw NotFoundException if document not found", async () => {
      const updateDto: UpdateDocumentDto = { title: "Updated" };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        new NotFoundException("Document with ID 1 not found")
      );
    });
  });

  describe("delete", () => {
    it("should delete a document without file", async () => {
      const documentWithoutFile = { ...mockDocument, filePath: null };
      mockRepository.findOne.mockResolvedValue(documentWithoutFile);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it("should delete a document with file", async () => {
      const documentWithFile = { ...mockDocument, filePath: "/path/to/file" };
      mockRepository.findOne.mockResolvedValue(documentWithFile);
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      mockFs.existsSync.mockReturnValue(true);

      await service.delete(1);

      expect(mockFs.unlinkSync).toHaveBeenCalledWith("/path/to/file");
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should delete a document when file doesn't exist", async () => {
      const documentWithFile = { ...mockDocument, filePath: "/path/to/file" };
      mockRepository.findOne.mockResolvedValue(documentWithFile);
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      mockFs.existsSync.mockReturnValue(false);

      await service.delete(1);

      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if document not found in repository", async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1)).rejects.toThrow(
        new NotFoundException("Document with ID 1 not found")
      );
    });

    it("should throw error for foreign key constraint violation", async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      const error: any = new Error("Foreign key violation");
      error.code = "23503";
      mockRepository.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow(
        "Cannot delete document: Document has associated records. Please remove associated ingestion processes first."
      );
    });

    it("should rethrow other errors", async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      const error = new Error("Some other error");
      mockRepository.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow("Some other error");
    });
  });

  describe("upload", () => {
    it("should upload a file and create document", async () => {
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

      const createdDocument = {
        title: "test.txt",
        type: "text/plain",
        filePath: expect.stringContaining("test.txt"),
        size: 100,
      };

      mockRepository.create.mockReturnValue(createdDocument);
      mockRepository.save.mockResolvedValue({ ...createdDocument, id: 1 });

      const result = await service.upload(mockFile);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("test.txt"),
        mockFile.buffer
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: "test.txt",
        type: "text/plain",
        filePath: expect.stringContaining("test.txt"),
        size: 100,
      });
      expect(result).toEqual({ ...createdDocument, id: 1 });
    });

    it("should throw NotFoundException if no file provided", async () => {
      await expect(service.upload(null)).rejects.toThrow(
        new NotFoundException("No file provided")
      );
    });
  });
});
