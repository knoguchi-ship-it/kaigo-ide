import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TenantDao } from '../firestore/daos/tenant.dao';
import { UserDao } from '../firestore/daos/user.dao';
import type { JwtPayload } from './strategies/jwt-payload.interface';
import * as crypto from 'crypto';
import { AuditLogService } from '../audit/audit-log.service';

type AuthUserDoc = {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly tenantDao: TenantDao,
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLog: AuditLogService,
  ) {}

  private isFirestoreEnabled() {
    return this.configService.get<string>('FIRESTORE_ENABLED') === 'true';
  }

  private buildLocalDevUser(email: string): AuthUserDoc {
    const normalizedEmail = email?.trim() || 'dev@kaigoidee.local';
    const suffix = crypto
      .createHash('sha256')
      .update(normalizedEmail)
      .digest('hex')
      .slice(0, 12);

    return {
      id: `dev-user-${suffix}`,
      email: normalizedEmail,
      name: '開発ユーザー',
      tenantId: 'dev-tenant',
      role: 'ADMIN',
    };
  }

  async validateUserById(userId: string) {
    const user = (await this.userDao.getUserByIdAnyTenant(userId)) as
      | AuthUserDoc
      | null;
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async loginWithGoogle(
    profile: {
      email: string;
      name: string;
      accessToken: string;
      refreshToken?: string;
    },
    req?: import('express').Request,
  ) {
    let user = (await this.userDao.getUserByEmailAnyTenant(profile.email)) as
      | AuthUserDoc
      | null;

    if (!user) {
      const tenant = await this.tenantDao.createTenant(`${profile.name}の事業所`);
      await this.userDao.createUser(tenant.id, {
        email: profile.email,
        name: profile.name,
        tenantId: tenant.id,
        role: 'ADMIN',
        googleAccessToken: profile.accessToken,
        googleRefreshToken: profile.refreshToken,
      });
      user = (await this.userDao.getUserByEmail(
        tenant.id,
        profile.email,
      )) as AuthUserDoc | null;
    } else {
      await this.userDao.updateUser(user.tenantId, user.id, {
        googleAccessToken: profile.accessToken,
        ...(profile.refreshToken && { googleRefreshToken: profile.refreshToken }),
      });
      user = (await this.userDao.getUserByIdAnyTenant(user.id)) as AuthUserDoc | null;
    }

    if (!user) throw new UnauthorizedException('User not found');
    this.auditLog.log(
      {
        eventType: 'AUTH_LOGIN',
        tenantId: user.tenantId,
        userId: user.id,
        userEmail: user.email,
        role: user.role,
        result: 'SUCCESS',
      },
      req,
    );
    return this.generateTokens(user);
  }

  async devLogin(email: string, req?: import('express').Request) {
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
    if (!isDev) throw new UnauthorizedException('Dev login is disabled');

    // Firestore未設定でも開発ログインだけは可能にする。
    if (!this.isFirestoreEnabled()) {
      const user = this.buildLocalDevUser(email);
      this.auditLog.log(
        {
          eventType: 'AUTH_LOGIN',
          tenantId: user.tenantId,
          userId: user.id,
          userEmail: user.email,
          role: user.role,
          result: 'SUCCESS',
        },
        req,
      );
      return this.generateTokens(user);
    }

    let user = (await this.userDao.getUserByEmailAnyTenant(email)) as
      | AuthUserDoc
      | null;

    if (!user) {
      const tenant = await this.tenantDao.createTenant('開発用事業所');
      await this.userDao.createUser(tenant.id, {
        email,
        name: '開発ユーザー',
        tenantId: tenant.id,
        role: 'ADMIN',
        hashedPassword: crypto
          .createHash('sha256')
          .update('dev-password')
          .digest('hex'),
      });
      user = (await this.userDao.getUserByEmail(tenant.id, email)) as
        | AuthUserDoc
        | null;
    }

    if (!user) throw new UnauthorizedException('User not found');
    this.auditLog.log(
      {
        eventType: 'AUTH_LOGIN',
        tenantId: user.tenantId,
        userId: user.id,
        userEmail: user.email,
        role: user.role,
        result: 'SUCCESS',
      },
      req,
    );
    return this.generateTokens(user);
  }

  async refreshAccessToken(refreshTokenStr: string, req?: import('express').Request) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshTokenStr);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    let user: AuthUserDoc | null = null;
    if (!this.isFirestoreEnabled()) {
      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (!isDev) throw new UnauthorizedException('User not found');
      user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        tenantId: payload.tenantId,
        role: payload.role,
      };
    } else {
      user = (await this.userDao.getUserByIdAnyTenant(payload.sub)) as
        | AuthUserDoc
        | null;
      if (!user) throw new UnauthorizedException('User not found');
    }

    this.auditLog.log(
      {
        eventType: 'AUTH_REFRESH',
        tenantId: user.tenantId,
        userId: user.id,
        userEmail: user.email,
        role: user.role,
        result: 'SUCCESS',
      },
      req,
    );

    return this.generateTokens(user);
  }

  private generateTokens(user: AuthUserDoc) {
    const basePayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign({ ...basePayload, type: 'access' as const });
    const refreshToken = this.jwtService.sign(
      { ...basePayload, type: 'refresh' as const },
      { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }
}
