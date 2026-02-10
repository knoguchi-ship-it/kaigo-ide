import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CareRecordService } from './care-record.service';
import { CreateCareRecordDto } from './dto/create-care-record.dto';
import { UpdateCareRecordDto } from './dto/update-care-record.dto';
import { CareRecordQueryDto } from './dto/care-record-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('clients/:clientId/care-records')
@UseGuards(JwtAuthGuard)
export class CareRecordController {
  constructor(private readonly careRecordService: CareRecordService) {}

  @Get()
  findAll(
    @Param('clientId') clientId: string,
    @Query() query: CareRecordQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.careRecordService.findAll(clientId, query, user.tenantId);
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
