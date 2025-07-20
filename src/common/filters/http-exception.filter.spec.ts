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

  it("should handle exception with object response", () => {
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

    const exceptionResponse = { message: "Custom error", error: "Bad Request" };
    const exception = new HttpException(exceptionResponse, 400);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      timestamp: expect.any(String),
      path: "/test",
      error: exceptionResponse,
    });
  });

  it("should handle non-HttpException errors", () => {
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

    const exception = new Error("Internal error");

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      timestamp: expect.any(String),
      path: "/test",
      error: exception,
    });
  });
});
