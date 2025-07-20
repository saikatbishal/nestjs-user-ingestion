import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { Role } from "./roles.enum";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { NotFoundException } from "@nestjs/common";

describe("UsersController", () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  let mockJwtAuthGuard: any;
  let mockRolesGuard: any;

  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: Role.VIEWER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUsersService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateRole: jest.fn(),
      delete: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    mockRolesGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const users = [mockUser];
      (mockUsersService.findAll as jest.Mock).mockResolvedValue(users);

      const result = await controller.getAllUsers();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it("should handle service errors", async () => {
      const error = new Error("Service error");
      (mockUsersService.findAll as jest.Mock).mockRejectedValue(error);

      await expect(controller.getAllUsers()).rejects.toThrow("Service error");
    });
  });

  describe("getUser", () => {
    it("should return a user by id", async () => {
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.getUser(1);

      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it("should handle service errors", async () => {
      const error = new Error("User not found");
      (mockUsersService.findById as jest.Mock).mockRejectedValue(error);

      await expect(controller.getUser(1)).rejects.toThrow("User not found");
    });
  });

  describe("updateUserRole", () => {
    it("should update user role", async () => {
      const updateDto: UpdateUserRoleDto = { role: Role.ADMIN };
      const updatedUser = { ...mockUser, role: Role.ADMIN };

      (mockUsersService.updateRole as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.updateUserRole(1, updateDto);

      expect(mockUsersService.updateRole).toHaveBeenCalledWith(1, Role.ADMIN);
      expect(result).toEqual(updatedUser);
    });

    it("should handle service errors", async () => {
      const updateDto: UpdateUserRoleDto = { role: Role.ADMIN };
      const error = new Error("Update failed");
      (mockUsersService.updateRole as jest.Mock).mockRejectedValue(error);

      await expect(controller.updateUserRole(1, updateDto)).rejects.toThrow(
        "Update failed"
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      (mockUsersService.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.deleteUser(1);

      expect(mockUsersService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: "User deleted successfully" });
    });

    it("should handle service errors", async () => {
      const error = new Error("Delete failed");
      (mockUsersService.delete as jest.Mock).mockRejectedValue(error);

      await expect(controller.deleteUser(1)).rejects.toThrow(
        "Failed to delete user: Delete failed"
      );
    });

    it("should re-throw NotFoundException directly", async () => {
      const notFoundError = new NotFoundException("User not found");
      (mockUsersService.delete as jest.Mock).mockRejectedValue(notFoundError);

      await expect(controller.deleteUser(1)).rejects.toThrow(NotFoundException);
    });
  });
});
