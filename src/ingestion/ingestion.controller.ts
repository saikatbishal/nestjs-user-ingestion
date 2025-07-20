import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../users/roles.enum";
import { IngestionService } from "./ingestion.service";
import { TriggerIngestionDto } from "./dto/trigger-ingestion.dto";

@Controller("ingestion")
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post("trigger")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async triggerIngestion(@Body() dto: TriggerIngestionDto) {
    return this.ingestionService.triggerIngestion(dto);
  }

  @Get("processes")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  async getIngestionProcesses() {
    return this.ingestionService.getAllProcesses();
  }

  @Get("processes/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  async getIngestionProcess(@Param("id", ParseIntPipe) id: number) {
    return this.ingestionService.getProcessById(id);
  }

  @Post("webhook")
  async handleWebhook(@Body() payload: any) {
    return this.ingestionService.handleWebhook(payload);
  }
}
