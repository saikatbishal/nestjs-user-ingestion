import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "./roles.enum";
import { UsersService } from "./users.service";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.EDITOR)
  async getUser(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Put(":id/role")
  @Roles(Role.ADMIN)
  async updateUserRole(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto
  ) {
    return this.usersService.updateRole(id, dto.role);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  async deleteUser(@Param("id", ParseIntPipe) id: number) {
    try {
      await this.usersService.delete(id);
      return { message: "User deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
