import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MonitoringRecordService } from './monitoring-record.service';
import { CreateMonitoringRecordDto } from './dto/create-monitoring-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import type { Request } from 'express';

@Controller('clients/:clientId/monitoring-records')
@UseGuards(JwtAuthGuard)
export class MonitoringRecordController {
  constructor(
    private readonly monitoringRecordService: MonitoringRecordService,
  ) {}

  @Get()
  findAll(
    @Param('clientId') clientId: string,
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.monitoringRecordService.findAll(clientId, user.tenantId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.monitoringRecordService.findOne(id, user.tenantId);
  }

  @Post()
  create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateMonitoringRecordDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.monitoringRecordService.create(clientId, dto, user.id, user.tenantId, req);
  }
}
