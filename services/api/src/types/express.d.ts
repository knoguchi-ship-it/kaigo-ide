import 'express';

declare module 'express' {
  interface Request {
    auditContext?: {
      ip?: string | null;
      userAgent?: string | null;
    };
  }
}
