import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CareRecordModule } from './care-record/care-record.module';
import { MonitoringRecordModule } from './monitoring-record/monitoring-record.module';
import { ClientModule } from './client/client.module';
import { CarePlanModule } from './care-plan/care-plan.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientModule,
    CarePlanModule,
    CareRecordModule,
    MonitoringRecordModule,
  ],
})
export class AppModule {}
