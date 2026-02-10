import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './strategies/jwt-payload.interface';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('ユーザーが見つかりません');
    return user;
  }

  async loginWithGoogle(profile: {
    email: string;
    name: string;
    accessToken: string;
    refreshToken?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      // 新規ユーザー: デフォルトテナントを作成
      const tenant = await this.prisma.tenant.create({
        data: { name: `${profile.name}の事業所` },
      });

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          tenantId: tenant.id,
          role: 'ADMIN',
          googleAccessToken: profile.accessToken,
          googleRefreshToken: profile.refreshToken,
        },
      });
    } else {
      // 既存ユーザー: トークン更新
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleAccessToken: profile.accessToken,
          ...(profile.refreshToken && {
            googleRefreshToken: profile.refreshToken,
          }),
        },
      });
    }

    return this.generateTokens(user);
  }

  async devLogin(email: string) {
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
    if (!isDev) throw new UnauthorizedException('開発環境のみ利用可能');

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const tenant = await this.prisma.tenant.create({
        data: { name: '開発用事業所' },
      });

      user = await this.prisma.user.create({
        data: {
          email,
          name: '開発ユーザー',
          tenantId: tenant.id,
          role: 'ADMIN',
          hashedPassword: crypto
            .createHash('sha256')
            .update('dev-password')
            .digest('hex'),
        },
      });
    }

    return this.generateTokens(user);
  }

  async refreshAccessToken(refreshTokenStr: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshTokenStr);
    } catch {
      throw new UnauthorizedException('リフレッシュトークンが無効または期限切れです');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('無効なリフレッシュトークンです');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('ユーザーが見つかりません');

    return this.generateTokens(user);
  }

  private generateTokens(user: { id: string; email: string; tenantId: string; role: string }) {
    const basePayload = {
      sub: user.id,
      email: user.email,
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
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }
}
