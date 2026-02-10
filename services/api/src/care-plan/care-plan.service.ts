import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarePlanDto } from './dto/create-care-plan.dto';

@Injectable()
export class CarePlanService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId: string, tenantId: string) {
    return this.prisma.carePlan.findMany({
      where: { clientId, client: { tenantId } },
      include: { goals: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { version: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const plan = await this.prisma.carePlan.findUnique({
      where: { id },
      include: {
        goals: { orderBy: { sortOrder: 'asc' } },
        client: true,
      },
    });
    if (!plan) throw new NotFoundException('ケアプランが見つかりません');
    if (plan.client.tenantId !== tenantId) throw new ForbiddenException();
    return plan;
  }

  async create(clientId: string, dto: CreateCarePlanDto, tenantId: string) {
    // テナント検証
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client || client.tenantId !== tenantId) throw new ForbiddenException();

    // トランザクション内で版数を採番（競合状態対策）
    return this.prisma.$transaction(async (tx) => {
      const latestPlan = await tx.carePlan.findFirst({
        where: { clientId },
        orderBy: { version: 'desc' },
      });

      const nextVersion = (latestPlan?.version ?? 0) + 1;

      return tx.carePlan.create({
        data: {
          clientId,
          version: nextVersion,
          createdDate: new Date(dto.createdDate),
          purpose: dto.purpose,
          goals: {
            create: dto.goals.map((g, i) => ({
              type: g.type,
              text: g.text,
              sortOrder: g.sortOrder ?? i,
            })),
          },
        },
        include: { goals: true },
      });
    });
  }
}
