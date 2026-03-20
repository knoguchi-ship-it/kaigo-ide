import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirestoreModule } from './firestore/firestore.module';
import { AuditModule } from './audit/audit.module';
import { CareRecordModule } from './care-record/care-record.module';
import { MonitoringRecordModule } from './monitoring-record/monitoring-record.module';
import { ClientModule } from './client/client.module';
import { CarePlanModule } from './care-plan/care-plan.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuditModule,
    FirestoreModule,
    AuthModule,
    ClientModule,
    CarePlanModule,
    CareRecordModule,
    MonitoringRecordModule,
    AiModule,
  ],
})
export class AppModule {}
