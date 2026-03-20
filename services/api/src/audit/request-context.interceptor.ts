import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    if (req) {
      req.auditContext = {
        ip:
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
          req.ip ??
          null,
        userAgent: req.headers['user-agent'] ?? null,
      };
    }
    return next.handle();
  }
}
