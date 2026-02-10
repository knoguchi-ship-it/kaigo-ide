import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', 'not-configured'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', 'not-configured'),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:4000/api/auth/google/callback',
      ),
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      accessType: 'offline',
      prompt: 'consent',
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: { emails?: { value: string }[]; displayName?: string },
    done: VerifyCallback,
  ) {
    const user = {
      email: profile.emails?.[0]?.value ?? '',
      name: profile.displayName ?? '',
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
