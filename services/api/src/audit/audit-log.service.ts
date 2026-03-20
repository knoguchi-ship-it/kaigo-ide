import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

export type AuditResult = 'SUCCESS' | 'FAIL';

export interface AuditLogEntry {
  eventType: string;
  timestamp?: string;
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  role?: string;
  clientId?: string | null;
  resourceId?: string | null;
  result: AuditResult;
  reason?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  log(entry: AuditLogEntry, req?: Request) {
    const reqCtx = req?.auditContext as { ip?: string | null; userAgent?: string | null } | undefined;
    const payload: AuditLogEntry = {
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      ip: entry.ip ?? reqCtx?.ip ?? 'unknown',
      userAgent: entry.userAgent ?? reqCtx?.userAgent ?? 'unknown',
    };
    // Cloud Run captures stdout -> Cloud Logging
    console.log(JSON.stringify(payload));
  }
}
