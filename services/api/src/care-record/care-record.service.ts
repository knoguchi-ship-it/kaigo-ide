import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FieldPath } from 'firebase-admin/firestore';
import { CareRecordDao } from '../firestore/daos/care-record.dao';
import { ClientDao } from '../firestore/daos/client.dao';
import { FirestoreService } from '../firestore/firestore.service';
import { toIsoString } from '../firestore/firestore.utils';
import { CreateCareRecordDto } from './dto/create-care-record.dto';
import { UpdateCareRecordDto } from './dto/update-care-record.dto';
import { CareRecordQueryDto } from './dto/care-record-query.dto';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class CareRecordService {
  constructor(
    private readonly firestore: FirestoreService,
    private readonly careRecordDao: CareRecordDao,
    private readonly clientDao: ClientDao,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(clientId: string, query: CareRecordQueryDto, tenantId: string) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    const records = await this.careRecordDao.listCareRecords(tenantId, clientId, {
      category: query.category,
      from,
      to,
      limit,
      offset: (page - 1) * limit,
    });

    let filtered = records;
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = records.filter((r) =>
        String(r.content ?? '').toLowerCase().includes(keyword),
      );
    }

    const db = this.firestore.firestore;
    let total = filtered.length;
    if (!query.keyword) {
      const baseQuery = db
        .collection('tenants')
        .doc(tenantId)
        .collection('clients')
        .doc(clientId)
        .collection('careRecords')
        .orderBy('recordDate', 'desc');

      let countQuery = baseQuery;
      if (query.category) countQuery = countQuery.where('category', '==', query.category);
      if (from) countQuery = countQuery.where('recordDate', '>=', from);
      if (to) countQuery = countQuery.where('recordDate', '<=', to);

      const countSnap = await countQuery.count().get();
      total = countSnap.data().count;
    }

    const data = filtered.map((r) => ({
      ...r,
      recordType: 'GENERAL' as const,
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
      .collectionGroup('careRecords')
      .where(FieldPath.documentId(), '==', id)
      .limit(1)
      .get();
    if (snap.empty) throw new NotFoundException('險倬鹸縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ');
    const doc = snap.docs[0];
    const data = doc.data();
    if (data.tenantId !== tenantId) throw new ForbiddenException();

    return {
      id: doc.id,
      ...data,
      recordType: 'GENERAL' as const,
      recordDate: toIsoString(data.recordDate) ?? data.recordDate,
      createdAt: toIsoString(data.createdAt) ?? data.createdAt,
      updatedAt: toIsoString(data.updatedAt) ?? data.updatedAt,
    };
  }

  async create(
    clientId: string,
    dto: CreateCareRecordDto,
    createdById: string,
    tenantId: string,
    req?: import('express').Request,
  ) {
    const client = await this.clientDao.getClient(tenantId, clientId);
    if (!client) throw new ForbiddenException();

    const { id } = await this.careRecordDao.createCareRecord(tenantId, clientId, {
      tenantId,
      clientId,
      recordDate: new Date(dto.recordDate),
      category: dto.category,
      content: dto.content,
      relatedOrganization: dto.relatedOrganization,
      professionalJudgment: dto.professionalJudgment,
      clientFamilyOpinion: dto.clientFamilyOpinion,
      createdById,
    });

    this.auditLog.log({
      eventType: 'CARE_RECORD_CREATE',
      tenantId,
      clientId,
      resourceId: id,
      userId: createdById,
      result: 'SUCCESS',
    }, req);

    return this.findOne(id, tenantId);
  }

  async update(
    id: string,
    dto: UpdateCareRecordDto,
    tenantId: string,
    req?: import('express').Request,
  ) {
    const db = this.firestore.firestore;
    const snap = await db
      .collectionGroup('careRecords')
      .where(FieldPath.documentId(), '==', id)
      .limit(1)
      .get();
    const doc = snap.docs[0];

    await doc.ref.set(
      {
        ...(dto.recordDate !== undefined && { recordDate: new Date(dto.recordDate) }),
        ...(dto.category !== undefined && { category: dto.category }),
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
        updatedAt: new Date(),
      },
      { merge: true },
    );

    this.auditLog.log({
      eventType: 'CARE_RECORD_UPDATE',
      tenantId,
      resourceId: id,
      result: 'SUCCESS',
    }, req);

    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string, req?: import('express').Request) {
    await this.findOne(id, tenantId);
    const db = this.firestore.firestore;
    const snap = await db
      .collectionGroup('careRecords')
      .where(FieldPath.documentId(), '==', id)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    await doc.ref.delete();
    this.auditLog.log({
      eventType: 'CARE_RECORD_DELETE',
      tenantId,
      resourceId: id,
      result: 'SUCCESS',
    }, req);
    return { id };
  }

  async findForExport(
    clientId: string,
    dateRange: { from?: string; to?: string },
    tenantId: string,
  ) {
    const client = await this.clientDao.getClient(tenantId, clientId);
    if (!client) throw new ForbiddenException();

    const from = dateRange.from ? new Date(dateRange.from) : undefined;
    const to = dateRange.to ? new Date(dateRange.to) : undefined;

    const records = await this.careRecordDao.listCareRecords(tenantId, clientId, {
      from,
      to,
      limit: 1000,
    });

    const normalizedClient = {
      ...client,
      tenantId,
      birthDate: toIsoString(client.birthDate) ?? client.birthDate,
      certificationDate: toIsoString(client.certificationDate) ?? client.certificationDate,
      createdAt: toIsoString(client.createdAt) ?? client.createdAt,
      updatedAt: toIsoString(client.updatedAt) ?? client.updatedAt,
    };

    const normalizedRecords = records.map((r) => ({
      ...r,
      recordType: 'GENERAL' as const,
      recordDate: toIsoString(r.recordDate) ?? r.recordDate,
      createdAt: toIsoString(r.createdAt) ?? r.createdAt,
      updatedAt: toIsoString(r.updatedAt) ?? r.updatedAt,
      client: normalizedClient,
    }));

    return { client: normalizedClient, records: normalizedRecords };
  }
}
