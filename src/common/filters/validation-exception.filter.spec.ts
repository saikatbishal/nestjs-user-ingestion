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
});
