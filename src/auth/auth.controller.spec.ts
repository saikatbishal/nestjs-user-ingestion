import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ message: "ok" }),
      login: jest.fn().mockResolvedValue({ accessToken: "jwt", refreshToken: "refresh" }),
      refresh: jest.fn().mockResolvedValue({ accessToken: "jwt", refreshToken: "refresh" }),
      requestPasswordReset: jest.fn().mockResolvedValue({ message: "sent" }),
      resetPassword: jest.fn().mockResolvedValue({ message: "reset" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: JwtAuthGuard, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should register", async () => {
    expect(await controller.register({ email: "a", password: "b" })).toEqual({ message: "ok" });
  });

  it("should login", async () => {
    expect(await controller.login({ email: "a", password: "b" })).toHaveProperty("accessToken");
  });

  it("should logout", async () => {
    expect(await controller.logout({} as any)).toEqual({
      message: "Logged out (client should delete token)",
    });
  });

  it("should refresh", async () => {
    expect(await controller.refresh("token")).toHaveProperty("accessToken");
  });

  it("should request password reset", async () => {
    expect(await controller.requestPasswordReset({ email: "a" })).toEqual({ message: "sent" });
  });

  it("should reset password", async () => {
    expect(await controller.resetPassword({ token: "t", newPassword: "n" })).toEqual({ message: "reset" });
  });
});