import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({
      orderBy: { familyNameKana: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('利用者が見つかりません');
    return client;
  }

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...dto,
        birthDate: new Date(dto.birthDate),
        certificationDate: new Date(dto.certificationDate),
      },
    });
  }
}
