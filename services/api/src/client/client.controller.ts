import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import type { Request } from 'express';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.clientService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.clientService.findOne(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateClientDto, @CurrentUser() user: AuthUser, @Req() req: Request) {
    return this.clientService.create(dto, user.tenantId, req);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.clientService.update(id, dto, user.tenantId, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser, @Req() req: Request) {
    return this.clientService.remove(id, user.tenantId, req);
  }
}
