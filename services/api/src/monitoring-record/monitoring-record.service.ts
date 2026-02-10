import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonitoringRecordDto } from './dto/create-monitoring-record.dto';

@Injectable()
export class MonitoringRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    clientId: string,
    tenantId: string,
    options?: { page?: number; limit?: number },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 20));

    const [records, total] = await Promise.all([
      this.prisma.monitoringRecord.findMany({
        where: { clientId, client: { tenantId } },
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          evaluations: { include: { goal: true } },
          carePlan: true,
          client: true,
        },
      }),
      this.prisma.monitoringRecord.count({
        where: { clientId, client: { tenantId } },
      }),
    ]);

    const data = records.map((r) => ({ ...r, recordType: 'MONITORING' as const }));

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, tenantId: string) {
    const record = await this.prisma.monitoringRecord.findUnique({
      where: { id },
      include: {
        evaluations: { include: { goal: true } },
        carePlan: { include: { goals: true } },
        client: true,
      },
    });
    if (!record) throw new NotFoundException('モニタリング記録が見つかりません');
    if (record.client.tenantId !== tenantId) throw new ForbiddenException();
    return { ...record, recordType: 'MONITORING' as const };
  }

  async create(
    clientId: string,
    dto: CreateMonitoringRecordDto,
    createdById: string,
    tenantId: string,
  ) {
    // テナント検証: client と carePlan が対象テナントに属することを確認
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client || client.tenantId !== tenantId) throw new ForbiddenException();

    const carePlan = await this.prisma.carePlan.findUnique({
      where: { id: dto.carePlanId },
      include: { goals: true },
    });
    if (!carePlan || carePlan.clientId !== clientId) throw new ForbiddenException();

    // goalIdがこのケアプランの目標に属するか検証
    const validGoalIds = new Set(carePlan.goals.map((g) => g.id));
    for (const evaluation of dto.evaluations) {
      if (!validGoalIds.has(evaluation.goalId)) {
        throw new BadRequestException(
          `目標ID "${evaluation.goalId}" はこのケアプランに存在しません`,
        );
      }
    }

    const record = await this.prisma.monitoringRecord.create({
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
    return { ...record, recordType: 'MONITORING' as const };
  }
}
