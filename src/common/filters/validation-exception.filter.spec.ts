import { ValidationExceptionFilter } from "./validation-exception.filter";
import { ArgumentsHost, BadRequestException } from "@nestjs/common";

describe("ValidationExceptionFilter", () => {
  it("should be defined", () => {
    expect(new ValidationExceptionFilter()).toBeDefined();
  });
  it("should catch and format validation error", () => {
    const filter = new ValidationExceptionFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as unknown as ArgumentsHost;
    const exception = new BadRequestException("validation fail");
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it("should handle validation errors with detailed messages", () => {
    const filter = new ValidationExceptionFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as unknown as ArgumentsHost;

    const validationResponse = {
      message: ["email must be a valid email", "password is too short"],
      error: "Bad Request",
      statusCode: 400,
    };
    const exception = new BadRequestException(validationResponse);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: "Validation Error",
      message: ["email must be a valid email", "password is too short"],
      timestamp: expect.any(String),
    });
  });

  it("should handle simple string error response", () => {
    const filter = new ValidationExceptionFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as unknown as ArgumentsHost;

    const exception = new BadRequestException("Simple error message");

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: "Validation Error",
      message: "Simple error message",
      timestamp: expect.any(String),
    });
  });
});
