import { LoggingInterceptor } from "./logging.interceptor";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";

describe("LoggingInterceptor", () => {
  it("should be defined", () => {
    expect(new LoggingInterceptor()).toBeDefined();
  });
  it("should log and pass through", (done) => {
    const interceptor = new LoggingInterceptor();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: "GET", url: "/test" }),
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of("data") };
    interceptor.intercept(context, next).subscribe((data) => {
      expect(data).toBe("data");
      done();
    });
  });
});
