import { Module } from '@nestjs/common';
import { CareRecordController } from './care-record.controller';
import { CareRecordService } from './care-record.service';

@Module({
  controllers: [CareRecordController],
  providers: [CareRecordService],
  exports: [CareRecordService],
})
export class CareRecordModule {}
