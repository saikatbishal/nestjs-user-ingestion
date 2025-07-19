import { RolesGuard } from "./roles.guard";
import { Reflector } from "@nestjs/core";

describe("RolesGuard", () => {
  it("should be defined", () => {
    expect(new RolesGuard(new Reflector())).toBeDefined();
  });
  it("should allow if no roles required", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as any;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: "admin" } }) }),
    } as any;
    expect(guard.canActivate(context)).toBe(true);
  });
  it("should allow if user has required role", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(["admin"]),
    } as any;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: "admin" } }) }),
    } as any;
    expect(guard.canActivate(context)).toBe(true);
  });
  it("should deny if user does not have required role", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(["admin"]),
    } as any;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: "user" } }) }),
    } as any;
    expect(guard.canActivate(context)).toBe(false);
  });
});
