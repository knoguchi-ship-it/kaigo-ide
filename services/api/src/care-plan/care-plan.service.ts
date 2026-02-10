import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarePlanDto } from './dto/create-care-plan.dto';

@Injectable()
export class CarePlanService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId: string) {
    return this.prisma.carePlan.findMany({
      where: { clientId },
      include: { goals: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { version: 'desc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.carePlan.findUnique({
      where: { id },
      include: { goals: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!plan) throw new NotFoundException('ケアプランが見つかりません');
    return plan;
  }

  async create(clientId: string, dto: CreateCarePlanDto) {
    const latestPlan = await this.prisma.carePlan.findFirst({
      where: { clientId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestPlan?.version ?? 0) + 1;

    return this.prisma.carePlan.create({
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
  }
}
