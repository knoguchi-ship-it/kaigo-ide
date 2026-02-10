import { Module } from '@nestjs/common';
import { MonitoringRecordController } from './monitoring-record.controller';
import { MonitoringRecordService } from './monitoring-record.service';

@Module({
  controllers: [MonitoringRecordController],
  providers: [MonitoringRecordService],
  exports: [MonitoringRecordService],
})
export class MonitoringRecordModule {}
