import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Document } from "./document.entity";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class DocumentsService {
  private readonly uploadPath = "./uploads";

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async findAll(): Promise<Document[]> {
    return this.documentsRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async create(dto: CreateDocumentDto): Promise<Document> {
    const document = this.documentsRepository.create({
      title: dto.title,
      content: dto.content,
      type: dto.type || "text",
      filePath: dto.filePath,
      size: dto.content ? dto.content.length : 0,
    });

    return this.documentsRepository.save(document);
  }

  async update(id: number, dto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findById(id);

    Object.assign(document, dto);

    if (dto.content) {
      document.size = dto.content.length;
    }

    return this.documentsRepository.save(document);
  }

  async delete(id: number): Promise<void> {
    const document = await this.findById(id);

    try {
      // Delete file if exists
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      // Use delete instead of remove for better performance
      const result = await this.documentsRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
    } catch (error) {
      if (error.code === "23503") {
        // Foreign key constraint violation
        throw new Error(
          `Cannot delete document: Document has associated records. Please remove associated ingestion processes first.`
        );
      }
      throw error;
    }
  }

  async upload(file: Express.Multer.File): Promise<Document> {
    if (!file) {
      throw new NotFoundException("No file provided");
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    const document = this.documentsRepository.create({
      title: file.originalname,
      type: file.mimetype,
      filePath: filePath,
      size: file.size,
    });

    return this.documentsRepository.save(document);
  }
}
