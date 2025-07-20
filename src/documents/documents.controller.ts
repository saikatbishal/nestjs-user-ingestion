import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../users/roles.enum";
import { DocumentsService } from "./documents.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";

@Controller("documents")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  async getAllDocuments() {
    return this.documentsService.findAll();
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  async getDocument(@Param("id", ParseIntPipe) id: number) {
    return this.documentsService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.EDITOR)
  async createDocument(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto);
  }

  @Post("upload")
  @Roles(Role.ADMIN, Role.EDITOR)
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    return this.documentsService.upload(file);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.EDITOR)
  async updateDocument(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDocumentDto
  ) {
    return this.documentsService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.EDITOR)
  async deleteDocument(@Param("id", ParseIntPipe) id: number) {
    try {
      await this.documentsService.delete(id);
      return { message: "Document deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }
}
