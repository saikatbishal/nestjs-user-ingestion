import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Role } from "./roles.enum";
import { NotFoundException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let mockRepository: any;

  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    password: "hashedPassword",
    role: Role.VIEWER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByEmail", () => {
    it("should return user by email", async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return undefined if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findByEmail("nonexistent@example.com");

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "new@example.com",
        name: "New User",
        password: "hashedPassword",
        role: Role.VIEWER,
      };

      mockRepository.create.mockReturnValue(userData);
      mockRepository.save.mockResolvedValue({ ...userData, id: 2 });

      const result = await service.create(userData);

      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockRepository.save).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ ...userData, id: 2 });
    });
  });

  describe("findAll", () => {
    it("should return all users with selected fields", async () => {
      const users = [
        {
          id: 1,
          email: "user1@example.com",
          name: "User 1",
          role: Role.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: "admin@example.com",
          name: "Admin",
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        select: ["id", "email", "name", "role", "createdAt", "updatedAt"],
      });
      expect(result).toEqual(users);
    });
  });

  describe("findById", () => {
    it("should return user by id", async () => {
      const userWithoutPassword = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(userWithoutPassword);

      const result = await service.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ["id", "email", "name", "role", "createdAt", "updatedAt"],
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(
        new NotFoundException("User with ID 1 not found")
      );
    });
  });

  describe("updateRole", () => {
    it("should update user role", async () => {
      const userWithoutPassword = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = { ...userWithoutPassword, role: Role.ADMIN };

      mockRepository.findOne.mockResolvedValue(userWithoutPassword);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateRole(1, Role.ADMIN);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...userWithoutPassword,
        role: Role.ADMIN,
      });
      expect(result).toEqual(updatedUser);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateRole(1, Role.ADMIN)).rejects.toThrow(
        new NotFoundException("User with ID 1 not found")
      );
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      const userWithoutPassword = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(userWithoutPassword);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if user not found during deletion", async () => {
      const userWithoutPassword = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(userWithoutPassword);
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1)).rejects.toThrow(
        new NotFoundException("User with ID 1 not found")
      );
    });

    it("should throw error for foreign key constraint violation", async () => {
      const userWithoutPassword = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(userWithoutPassword);
      const error: any = new Error("Foreign key violation");
      error.code = "23503";
      mockRepository.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow(
        "Cannot delete user: User has associated records. Please remove associated documents first."
      );
    });

    it("should rethrow other errors", async () => {
      const userWithoutPassword = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(userWithoutPassword);
      const error = new Error("Some other error");
      mockRepository.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow("Some other error");
    });
  });
});
