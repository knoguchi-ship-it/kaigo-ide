import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAll() {
    // TODO: テナントIDでフィルタ（認証実装後）
    return this.clientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientService.create(dto);
  }
}
