import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCareRecordDto } from './dto/create-care-record.dto';
import { UpdateCareRecordDto } from './dto/update-care-record.dto';
import { CareRecordQueryDto } from './dto/care-record-query.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class CareRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId: string, query: CareRecordQueryDto) {
    const where: Prisma.CareRecordWhereInput = { clientId };

    if (query.category) {
      where.category = query.category;
    }
    if (query.from || query.to) {
      where.recordDate = {};
      if (query.from) where.recordDate.gte = new Date(query.from);
      if (query.to) where.recordDate.lte = new Date(query.to);
    }
    if (query.keyword) {
      where.content = { contains: query.keyword, mode: 'insensitive' };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await Promise.all([
      this.prisma.careRecord.findMany({
        where,
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { client: true },
      }),
      this.prisma.careRecord.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.careRecord.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!record) throw new NotFoundException('記録が見つかりません');
    return record;
  }

  async create(clientId: string, dto: CreateCareRecordDto, createdById: string) {
    return this.prisma.careRecord.create({
      data: {
        clientId,
        recordDate: new Date(dto.recordDate),
        category: dto.category,
        content: dto.content,
        relatedOrganization: dto.relatedOrganization,
        professionalJudgment: dto.professionalJudgment,
        clientFamilyOpinion: dto.clientFamilyOpinion,
        createdById,
      },
    });
  }

  async update(id: string, dto: UpdateCareRecordDto) {
    await this.findOne(id);
    return this.prisma.careRecord.update({
      where: { id },
      data: {
        ...(dto.recordDate && { recordDate: new Date(dto.recordDate) }),
        ...(dto.category && { category: dto.category }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.relatedOrganization !== undefined && {
          relatedOrganization: dto.relatedOrganization,
        }),
        ...(dto.professionalJudgment !== undefined && {
          professionalJudgment: dto.professionalJudgment,
        }),
        ...(dto.clientFamilyOpinion !== undefined && {
          clientFamilyOpinion: dto.clientFamilyOpinion,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.careRecord.delete({ where: { id } });
  }
}
