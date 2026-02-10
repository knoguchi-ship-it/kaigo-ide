import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.client.findMany({
      where: { tenantId },
      orderBy: { familyNameKana: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('利用者が見つかりません');
    if (client.tenantId !== tenantId) throw new ForbiddenException();
    return client;
  }

  async create(dto: CreateClientDto, tenantId: string) {
    return this.prisma.client.create({
      data: {
        tenantId,
        familyName: dto.familyName,
        givenName: dto.givenName,
        familyNameKana: dto.familyNameKana,
        givenNameKana: dto.givenNameKana,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        insuranceNumber: dto.insuranceNumber,
        careLevel: dto.careLevel,
        certificationDate: new Date(dto.certificationDate),
        address: dto.address,
        phone: dto.phone,
      },
    });
  }

  async update(id: string, dto: UpdateClientDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.familyName !== undefined && { familyName: dto.familyName }),
        ...(dto.givenName !== undefined && { givenName: dto.givenName }),
        ...(dto.familyNameKana !== undefined && { familyNameKana: dto.familyNameKana }),
        ...(dto.givenNameKana !== undefined && { givenNameKana: dto.givenNameKana }),
        ...(dto.birthDate !== undefined && { birthDate: new Date(dto.birthDate) }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.insuranceNumber !== undefined && { insuranceNumber: dto.insuranceNumber }),
        ...(dto.careLevel !== undefined && { careLevel: dto.careLevel }),
        ...(dto.certificationDate !== undefined && {
          certificationDate: new Date(dto.certificationDate),
        }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.client.delete({ where: { id } });
  }
}
