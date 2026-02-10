import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonitoringRecordDto } from './dto/create-monitoring-record.dto';

@Injectable()
export class MonitoringRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    clientId: string,
    options?: { page?: number; limit?: number },
  ) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    const [data, total] = await Promise.all([
      this.prisma.monitoringRecord.findMany({
        where: { clientId },
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          evaluations: { include: { goal: true } },
          carePlan: true,
          client: true,
        },
      }),
      this.prisma.monitoringRecord.count({ where: { clientId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.monitoringRecord.findUnique({
      where: { id },
      include: {
        evaluations: { include: { goal: true } },
        carePlan: { include: { goals: true } },
        client: true,
      },
    });
    if (!record) throw new NotFoundException('モニタリング記録が見つかりません');
    return record;
  }

  async create(
    clientId: string,
    dto: CreateMonitoringRecordDto,
    createdById: string,
  ) {
    return this.prisma.monitoringRecord.create({
      data: {
        clientId,
        carePlanId: dto.carePlanId,
        recordDate: new Date(dto.recordDate),
        overallComment: dto.overallComment,
        professionalJudgment: dto.professionalJudgment,
        nextAction: dto.nextAction,
        createdById,
        evaluations: {
          create: dto.evaluations.map((e) => ({
            goalId: e.goalId,
            goalText: e.goalText,
            rating: e.rating,
            comment: e.comment,
          })),
        },
      },
      include: { evaluations: true },
    });
  }
}
