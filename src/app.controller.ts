import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): object {
    return {
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
    };
  }

  @Get("health")
  getHealth(): object {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
    };
  }
}
