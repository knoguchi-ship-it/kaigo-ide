import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 開発環境用: メールでログイン（パスワード不要） */
  @Post('dev-login')
  async devLogin(@Body('email') email: string, @Req() req: Request) {
    return this.authService.devLogin(email, req);
  }

  /** Google OAuth: リダイレクト開始 */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // PassportがGoogleにリダイレクト
  }

  /** Google OAuth: コールバック */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as {
      email: string;
      name: string;
      accessToken: string;
      refreshToken?: string;
    };
    const tokens = await this.authService.loginWithGoogle(user, req);

    // フロントエンドにトークンを渡す（URLフラグメント経由 - サーバーログに残らない）
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback#token=${tokens.accessToken}&refresh=${tokens.refreshToken}`,
    );
  }

  /** トークンリフレッシュ */
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string, @Req() req: Request) {
    return this.authService.refreshAccessToken(refreshToken, req);
  }

  /** 認証状態確認 */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@CurrentUser() user: { id: string; email: string; tenantId: string; role: string }) {
    return { user };
  }
}
