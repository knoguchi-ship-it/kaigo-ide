import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CarePlanService } from './care-plan.service';
import { CreateCarePlanDto } from './dto/create-care-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('clients/:clientId/care-plans')
@UseGuards(JwtAuthGuard)
export class CarePlanController {
  constructor(private readonly carePlanService: CarePlanService) {}

  @Get()
  findAll(@Param('clientId') clientId: string, @CurrentUser() user: AuthUser) {
    return this.carePlanService.findAll(clientId, user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.carePlanService.findOne(id, user.tenantId);
  }

  @Post()
  create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateCarePlanDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.carePlanService.create(clientId, dto, user.tenantId);
  }
}
