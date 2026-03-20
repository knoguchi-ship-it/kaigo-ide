import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';
import type { FirestoreDoc } from '../firestore.types';

@Injectable()
export class CareRecordDao {
  constructor(private readonly firestore: FirestoreService) {}

  async listCareRecords(
    tenantId: string,
    clientId: string,
    options?: {
      limit?: number;
      offset?: number;
      startAfter?: string;
      category?: string;
      from?: Date;
      to?: Date;
    },
  ) {
    const db = this.firestore.firestore;
    let query = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('careRecords')
      .orderBy('recordDate', 'desc');

    if (options?.category) query = query.where('category', '==', options.category);
    if (options?.from) query = query.where('recordDate', '>=', options.from);
    if (options?.to) query = query.where('recordDate', '<=', options.to);

    if (options?.startAfter) {
      const startDoc = await db
        .collection('tenants')
        .doc(tenantId)
        .collection('clients')
        .doc(clientId)
        .collection('careRecords')
        .doc(options.startAfter)
        .get();
      if (startDoc.exists) query = query.startAfter(startDoc);
    }

    if (options?.offset) query = query.offset(options.offset);
    if (options?.limit) query = query.limit(options.limit);

    const snap = await query.get();
    return snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreDoc,
    );
  }

  async getCareRecord(
    tenantId: string,
    clientId: string,
    careRecordId: string,
  ) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('careRecords')
      .doc(careRecordId)
      .get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreDoc;
  }

  async createCareRecord(
    tenantId: string,
    clientId: string,
    record: Record<string, unknown>,
  ) {
    const db = this.firestore.firestore;
    const ref = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('careRecords')
      .doc();
    const now = new Date();
    await ref.set({ ...record, createdAt: now, updatedAt: now });
    return { id: ref.id };
  }

  async updateCareRecord(
    tenantId: string,
    clientId: string,
    careRecordId: string,
    patch: Record<string, unknown>,
  ) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('careRecords')
      .doc(careRecordId)
      .set({ ...patch, updatedAt: new Date() }, { merge: true });
  }

  async deleteCareRecord(
    tenantId: string,
    clientId: string,
    careRecordId: string,
  ) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('careRecords')
      .doc(careRecordId)
      .delete();
  }
}
