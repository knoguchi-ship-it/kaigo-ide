import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RequestContextInterceptor } from './audit/request-context.interceptor';
import { AuditExceptionFilter } from './audit/audit-exception.filter';
import { AuditLogService } from './audit/audit-log.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalInterceptors(new RequestContextInterceptor());
  app.useGlobalFilters(new AuditExceptionFilter(app.get(AuditLogService)));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`KaigoIDE API running on http://localhost:${port}`);
}

bootstrap();
