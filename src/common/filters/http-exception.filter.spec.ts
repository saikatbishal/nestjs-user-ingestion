import { HttpExceptionFilter } from "./http-exception.filter";
import { ArgumentsHost, HttpException } from "@nestjs/common";

describe("HttpExceptionFilter", () => {
  it("should be defined", () => {
    expect(new HttpExceptionFilter()).toBeDefined();
  });
  it("should catch and format exception", () => {
    const filter = new HttpExceptionFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = { url: "/test" };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
    const exception = new HttpException("fail", 400);
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
