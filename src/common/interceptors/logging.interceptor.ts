import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();
    this.logger.log(`Incoming Request: ${method} ${url}`);
    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `Request ${method} ${url} completed in ${Date.now() - now}ms`
          )
        )
      );
  }
}
