import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  it("should be defined", () => {
    expect(new JwtStrategy()).toBeDefined();
  });
  it("should validate payload", async () => {
    const strategy = new JwtStrategy();
    const payload = { sub: 1, email: "a", role: "admin" };
    expect(await strategy.validate(payload)).toEqual({
      userId: 1,
      email: "a",
      role: "admin",
    });
  });
});
