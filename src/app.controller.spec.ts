import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";

describe("AppController", () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getHello", () => {
    it("should return API information", () => {
      const result = controller.getHello();

      expect(result).toEqual({
        message: "NestJS User & Document Management API",
        version: "1.0.0",
        endpoints: {
          swagger: "/api",
          auth: {
            register: "POST /auth/register",
            login: "POST /auth/login",
            logout: "POST /auth/logout",
            refresh: "POST /auth/refresh",
            "request-password-reset": "POST /auth/request-password-reset",
            "reset-password": "POST /auth/reset-password",
          },
          users: "GET /users",
          documents: "GET /documents",
          ingestion: "GET /ingestion",
        },
      });
    });
  });

  describe("getHealth", () => {
    it("should return health status", () => {
      const result = controller.getHealth() as any;

      expect(result).toHaveProperty("status", "OK");
      expect(result).toHaveProperty("timestamp");
      expect(typeof result.timestamp).toBe("string");
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });
});
