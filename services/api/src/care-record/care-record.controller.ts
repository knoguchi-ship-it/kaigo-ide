import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CareRecordService } from './care-record.service';
import { CreateCareRecordDto } from './dto/create-care-record.dto';
import { UpdateCareRecordDto } from './dto/update-care-record.dto';
import { CareRecordQueryDto } from './dto/care-record-query.dto';

@Controller('clients/:clientId/care-records')
export class CareRecordController {
  constructor(private readonly careRecordService: CareRecordService) {}

  @Get()
  findAll(
    @Param('clientId') clientId: string,
    @Query() query: CareRecordQueryDto,
  ) {
    return this.careRecordService.findAll(clientId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.careRecordService.findOne(id);
  }

  @Post()
  create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateCareRecordDto,
  ) {
    // TODO: createdById from JWT auth
    return this.careRecordService.create(clientId, dto, 'temp_user_id');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCareRecordDto) {
    return this.careRecordService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.careRecordService.remove(id);
  }
}
