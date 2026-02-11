import { Module } from '@nestjs/common';
import { CareRecordController } from './care-record.controller';
import { CareRecordService } from './care-record.service';
import { CareRecordPdfService } from './care-record-pdf.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [CareRecordController],
  providers: [CareRecordService, CareRecordPdfService],
  exports: [CareRecordService],
})
export class CareRecordModule {}
