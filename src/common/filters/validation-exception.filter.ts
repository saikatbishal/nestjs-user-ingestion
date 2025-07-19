import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.BAD_REQUEST;
    const exceptionResponse = exception.getResponse();
    const message = (exceptionResponse as any).message || exceptionResponse;

    response.status(status).json({
      statusCode: status,
      error: "Validation Error",
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
