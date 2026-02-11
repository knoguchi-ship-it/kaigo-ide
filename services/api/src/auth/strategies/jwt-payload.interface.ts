export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
  type: 'access' | 'refresh';
}
