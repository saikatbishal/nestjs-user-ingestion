import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import * as bcrypt from "bcryptjs";

const mockUser = {
  id: 1,
  email: "test@example.com",
  password: bcrypt.hashSync("password", 10),
  role: "admin",
  refreshToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
};

describe("AuthService", () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let userRepository: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue("jwt-token"),
      verify: jest.fn().mockReturnValue({ sub: mockUser.id }),
    };

    userRepository = {
      save: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should register a user", async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValueOnce(undefined);
    const result = await service.register({
      email: "test@example.com",
      password: "password",
    });
    expect(result.message).toBe("Registration successful");
  });

  it("should not register if email exists", async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
    await expect(
      service.register({ email: "test@example.com", password: "password" })
    ).rejects.toThrow();
  });

  it("should login with correct credentials", async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
    userRepository.save.mockResolvedValueOnce({
      ...mockUser,
      refreshToken: "new-refresh-token",
    });

    const result = await service.login({
      email: "test@example.com",
      password: "password",
    });

    expect(result.accessToken).toBe("jwt-token");
    expect(result.refreshToken).toBeDefined();
    expect(userRepository.save).toHaveBeenCalled();
  });

  it("should not login with wrong credentials", async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValueOnce(undefined);
    await expect(
      service.login({ email: "test@example.com", password: "wrong" })
    ).rejects.toThrow();
  });

  it("should refresh token", async () => {
    userRepository.findOne.mockResolvedValueOnce(mockUser);
    userRepository.save.mockResolvedValueOnce({
      ...mockUser,
      refreshToken: "new-refresh-token",
    });

    const result = await service.refresh("some-refresh-token");

    expect(result.accessToken).toBe("jwt-token");
    expect(result.refreshToken).toBeDefined();
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { refreshToken: "some-refresh-token" },
    });
    expect(userRepository.save).toHaveBeenCalled();
  });

  it("should throw on invalid refresh token", async () => {
    userRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.refresh("bad-token")).rejects.toThrow(
      "Invalid refresh token"
    );
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { refreshToken: "bad-token" },
    });
  });

  it("should request password reset", async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
    userRepository.save.mockResolvedValueOnce({
      ...mockUser,
      resetPasswordToken: "reset-token",
    });

    const result = await service.requestPasswordReset({
      email: "test@example.com",
    });

    expect(result.message).toBeDefined();
    expect(result.token).toBeDefined();
    expect(userRepository.save).toHaveBeenCalled();
  });

  it("should reset password", async () => {
    const userWithToken = {
      ...mockUser,
      resetPasswordToken: "valid-token",
      resetPasswordExpires: Date.now() + 1000 * 60 * 60, // 1 hour from now
    };
    userRepository.findOne.mockResolvedValueOnce(userWithToken);
    userRepository.save.mockResolvedValueOnce({
      ...userWithToken,
      resetPasswordToken: null,
    });

    const result = await service.resetPassword({
      token: "valid-token",
      newPassword: "newpass",
    });

    expect(result.message).toBeDefined();
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { resetPasswordToken: "valid-token" },
    });
    expect(userRepository.save).toHaveBeenCalled();
  });
});
