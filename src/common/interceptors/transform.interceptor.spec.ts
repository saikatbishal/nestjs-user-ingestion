import { TransformInterceptor } from "./transform.interceptor";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";

describe("TransformInterceptor", () => {
  it("should be defined", () => {
    expect(new TransformInterceptor()).toBeDefined();
  });
  it("should transform response", (done) => {
    const interceptor = new TransformInterceptor();
    const context = {} as ExecutionContext;
    const next: CallHandler = { handle: () => of("data") };
    interceptor.intercept(context, next).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toBe("data");
      expect(result.timestamp).toBeDefined();
      done();
    });
  });
});
