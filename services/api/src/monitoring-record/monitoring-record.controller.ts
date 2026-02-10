import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MonitoringRecordService } from './monitoring-record.service';
import { CreateMonitoringRecordDto } from './dto/create-monitoring-record.dto';

@Controller('clients/:clientId/monitoring-records')
export class MonitoringRecordController {
  constructor(
    private readonly monitoringRecordService: MonitoringRecordService,
  ) {}

  @Get()
  findAll(
    @Param('clientId') clientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.monitoringRecordService.findAll(clientId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monitoringRecordService.findOne(id);
  }

  @Post()
  create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateMonitoringRecordDto,
  ) {
    // TODO: createdById from JWT auth
    return this.monitoringRecordService.create(clientId, dto, 'temp_user_id');
  }
}
