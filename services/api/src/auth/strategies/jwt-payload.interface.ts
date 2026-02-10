export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
  type: 'access' | 'refresh';
}
