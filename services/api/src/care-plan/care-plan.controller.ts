import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CarePlanService } from './care-plan.service';
import { CreateCarePlanDto } from './dto/create-care-plan.dto';

@Controller('clients/:clientId/care-plans')
export class CarePlanController {
  constructor(private readonly carePlanService: CarePlanService) {}

  @Get()
  findAll(@Param('clientId') clientId: string) {
    return this.carePlanService.findAll(clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carePlanService.findOne(id);
  }

  @Post()
  create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateCarePlanDto,
  ) {
    return this.carePlanService.create(clientId, dto);
  }
}
