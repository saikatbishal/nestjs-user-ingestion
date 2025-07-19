import { formatError } from "./error.util";

describe("formatError", () => {
  it("should format string error", () => {
    expect(formatError("fail")).toEqual({ message: "fail" });
  });
  it("should format Error instance", () => {
    const err = new Error("fail");
    const result = formatError(err);
    expect(result.message).toBe("fail");
    expect(result.details).toBeDefined();
  });
  it("should format unknown error", () => {
    expect(formatError({ foo: "bar" })).toEqual({
      message: "Unknown error",
      details: { foo: "bar" },
    });
  });
});
