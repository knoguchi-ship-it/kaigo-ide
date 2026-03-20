import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuditLogService } from './audit-log.service';

@Catch(ForbiddenException, UnauthorizedException)
export class AuditExceptionFilter implements ExceptionFilter {
  constructor(private readonly auditLog: AuditLogService) {}

  catch(exception: ForbiddenException | UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const user = (req as any)?.user as
      | { id?: string; email?: string; tenantId?: string; role?: string }
      | undefined;

    const eventType =
      exception instanceof ForbiddenException ? 'ROLE_DENIED' : 'AUTH_FAILED';

    this.auditLog.log(
      {
        eventType,
        tenantId: user?.tenantId,
        userId: user?.id,
        userEmail: user?.email,
        role: user?.role,
        result: 'FAIL',
        reason: exception.message,
      },
      req,
    );
  }
}
