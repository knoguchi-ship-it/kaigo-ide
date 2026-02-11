import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CareRecordService } from './care-record.service';
import { CareRecordPdfService } from './care-record-pdf.service';
import { CreateCareRecordDto } from './dto/create-care-record.dto';
import { UpdateCareRecordDto } from './dto/update-care-record.dto';
import { CareRecordQueryDto } from './dto/care-record-query.dto';
import { ExportPdfQueryDto } from './dto/export-pdf-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('clients/:clientId/care-records')
@UseGuards(JwtAuthGuard)
export class CareRecordController {
  constructor(
    private readonly careRecordService: CareRecordService,
    private readonly careRecordPdfService: CareRecordPdfService,
  ) {}

  @Get()
  findAll(
    @Param('clientId') clientId: string,
    @Query() query: CareRecordQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.careRecordService.findAll(clientId, query, user.tenantId);
  }

  @Get('export/pdf')
  async exportPdf(
    @Param('clientId') clientId: string,
    @Query() query: ExportPdfQueryDto,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const { client, records } = await this.careRecordService.findForExport(
      clientId,
      { from: query.from, to: query.to },
      user.tenantId,
    );

    const pdfBuffer = await this.careRecordPdfService.generateTable5Pdf(
      client,
      records,
      user.name,
      { from: query.from, to: query.to },
    );

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `care-record-${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.careRecordService.findOne(id, user.tenantId);
  }

  @Post()
  create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateCareRecordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.careRecordService.create(clientId, dto, user.id, user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCareRecordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.careRecordService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.careRecordService.remove(id, user.tenantId);
  }
}
