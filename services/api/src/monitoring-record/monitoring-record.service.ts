import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FieldPath } from 'firebase-admin/firestore';
import { CarePlanDao } from '../firestore/daos/care-plan.dao';
import { ClientDao } from '../firestore/daos/client.dao';
import { MonitoringRecordDao } from '../firestore/daos/monitoring-record.dao';
import { FirestoreService } from '../firestore/firestore.service';
import { toIsoString } from '../firestore/firestore.utils';
import { CreateMonitoringRecordDto } from './dto/create-monitoring-record.dto';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class MonitoringRecordService {
  constructor(
    private readonly firestore: FirestoreService,
    private readonly monitoringRecordDao: MonitoringRecordDao,
    private readonly clientDao: ClientDao,
    private readonly carePlanDao: CarePlanDao,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(
    clientId: string,
    tenantId: string,
    options?: { page?: number; limit?: number },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 20));

    const records = await this.monitoringRecordDao.listMonitoringRecords(tenantId, clientId, {
      limit,
      offset: (page - 1) * limit,
    });

    const db = this.firestore.firestore;
    const countQuery = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('monitoringRecords')
      .orderBy('recordDate', 'desc');
    const countSnap = await countQuery.count().get();
    const total = countSnap.data().count;

    const data = records.map((r) => ({
      ...r,
      recordType: 'MONITORING' as const,
      recordDate: toIsoString(r.recordDate) ?? r.recordDate,
      createdAt: toIsoString(r.createdAt) ?? r.createdAt,
      updatedAt: toIsoString(r.updatedAt) ?? r.updatedAt,
    }));

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, tenantId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collectionGroup('monitoringRecords')
      .where(FieldPath.documentId(), '==', id)
      .limit(1)
      .get();
    if (snap.empty) {
      throw new NotFoundException('繝｢繝九ち繝ｪ繝ｳ繧ｰ險倬鹸縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ');
    }

    const doc = snap.docs[0];
    const data = doc.data();
    if (data.tenantId !== tenantId) throw new ForbiddenException();

    return {
      id: doc.id,
      ...data,
      recordType: 'MONITORING' as const,
      recordDate: toIsoString(data.recordDate) ?? data.recordDate,
      createdAt: toIsoString(data.createdAt) ?? data.createdAt,
      updatedAt: toIsoString(data.updatedAt) ?? data.updatedAt,
    };
  }

  async create(
    clientId: string,
    dto: CreateMonitoringRecordDto,
    createdById: string,
    tenantId: string,
    req?: import('express').Request,
  ) {
    const client = await this.clientDao.getClient(tenantId, clientId);
    if (!client) throw new ForbiddenException();

    const carePlan = await this.carePlanDao.getCarePlan(tenantId, clientId, dto.carePlanId);
    if (!carePlan) throw new ForbiddenException();

    const validGoalIds = new Set(
      (carePlan.goals ?? []).map((g: { id: string }) => g.id),
    );
    for (const evaluation of dto.evaluations) {
      if (!validGoalIds.has(evaluation.goalId)) {
        throw new BadRequestException(
          `逶ｮ讓僮D "${evaluation.goalId}" 縺ｯ縺薙・繧ｱ繧｢繝励Λ繝ｳ縺ｫ蟄伜惠縺励∪縺帙ｓ`,
        );
      }
    }

    const { id } = await this.monitoringRecordDao.createMonitoringRecord(
      tenantId,
      clientId,
      {
        tenantId,
        clientId,
        carePlanId: dto.carePlanId,
        recordDate: new Date(dto.recordDate),
        overallComment: dto.overallComment,
        professionalJudgment: dto.professionalJudgment,
        nextAction: dto.nextAction,
        createdById,
        evaluations: dto.evaluations.map((e) => ({
          id: this.firestore.firestore.collection('_ids').doc().id,
          monitoringRecordId: 'pending',
          goalId: e.goalId,
          goalText: e.goalText,
          rating: e.rating,
          comment: e.comment,
        })),
      },
    );

    this.auditLog.log({
      eventType: 'MONITORING_RECORD_CREATE',
      tenantId,
      clientId,
      resourceId: id,
      userId: createdById,
      result: 'SUCCESS',
    }, req);

    const db = this.firestore.firestore;
    const docSnap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('monitoringRecords')
      .doc(id)
      .get();
    const data = docSnap.data() ?? {};

    if (Array.isArray(data.evaluations)) {
      const patched = data.evaluations.map((e: { monitoringRecordId?: string }) => ({
        ...e,
        monitoringRecordId: id,
      }));
      await docSnap.ref.set({ evaluations: patched, updatedAt: new Date() }, { merge: true });
    }

    return this.findOne(id, tenantId);
  }
}
