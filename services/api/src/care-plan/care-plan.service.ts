import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FieldPath } from 'firebase-admin/firestore';
import { CarePlanDao } from '../firestore/daos/care-plan.dao';
import { ClientDao } from '../firestore/daos/client.dao';
import { FirestoreService } from '../firestore/firestore.service';
import { toIsoString } from '../firestore/firestore.utils';
import { CreateCarePlanDto } from './dto/create-care-plan.dto';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class CarePlanService {
  constructor(
    private readonly firestore: FirestoreService,
    private readonly carePlanDao: CarePlanDao,
    private readonly clientDao: ClientDao,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(clientId: string, tenantId: string) {
    const plans = await this.carePlanDao.listCarePlans(tenantId, clientId);
    return plans.map((p) => ({
      ...p,
      clientId,
      goals: (p.goals ?? []).sort(
        (a: { sortOrder?: number }, b: { sortOrder?: number }) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      ),
      createdDate: toIsoString(p.createdDate) ?? p.createdDate,
      createdAt: toIsoString(p.createdAt) ?? p.createdAt,
      updatedAt: toIsoString(p.updatedAt) ?? p.updatedAt,
    }));
  }

  async findOne(id: string, tenantId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collectionGroup('carePlans')
      .where(FieldPath.documentId(), '==', id)
      .limit(1)
      .get();
    if (snap.empty) throw new NotFoundException('繧ｱ繧｢繝励Λ繝ｳ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ');

    const doc = snap.docs[0];
    const data = doc.data();
    if (data.tenantId !== tenantId) throw new ForbiddenException();

    return {
      id: doc.id,
      ...data,
      goals: (data.goals ?? []).sort(
        (a: { sortOrder?: number }, b: { sortOrder?: number }) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      ),
      createdDate: toIsoString(data.createdDate) ?? data.createdDate,
      createdAt: toIsoString(data.createdAt) ?? data.createdAt,
      updatedAt: toIsoString(data.updatedAt) ?? data.updatedAt,
    };
  }

  async create(
    clientId: string,
    dto: CreateCarePlanDto,
    tenantId: string,
    req?: import('express').Request,
  ) {
    const client = await this.clientDao.getClient(tenantId, clientId);
    if (!client) throw new ForbiddenException();

    const db = this.firestore.firestore;
    const plansRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('carePlans');

    const result = await db.runTransaction(async (tx) => {
      const latestSnap = await tx
        .get(plansRef.orderBy('version', 'desc').limit(1))
        .then((s) => (s.empty ? null : s.docs[0]));

      const nextVersion = (latestSnap?.data().version ?? 0) + 1;
      const ref = plansRef.doc();
      const now = new Date();

      const goals = dto.goals.map((g, i) => ({
        id: db.collection('_ids').doc().id,
        carePlanId: ref.id,
        type: g.type,
        text: g.text,
        sortOrder: g.sortOrder ?? i,
      }));

      const payload = {
        tenantId,
        clientId,
        version: nextVersion,
        createdDate: new Date(dto.createdDate),
        purpose: dto.purpose,
        goals,
        createdAt: now,
        updatedAt: now,
      };

      tx.set(ref, payload);
      return { id: ref.id, ...payload };
    });

    this.auditLog.log({
      eventType: 'CARE_PLAN_CREATE',
      tenantId,
      clientId,
      resourceId: result.id,
      result: 'SUCCESS',
    }, req);

    return {
      ...result,
      createdDate: toIsoString(result.createdDate) ?? result.createdDate,
      createdAt: toIsoString(result.createdAt) ?? result.createdAt,
      updatedAt: toIsoString(result.updatedAt) ?? result.updatedAt,
    };
  }
}
