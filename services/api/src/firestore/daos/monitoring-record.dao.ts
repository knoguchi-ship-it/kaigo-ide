import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';
import type { FirestoreDoc } from '../firestore.types';

@Injectable()
export class MonitoringRecordDao {
  constructor(private readonly firestore: FirestoreService) {}

  async listMonitoringRecords(
    tenantId: string,
    clientId: string,
    options?: { limit?: number; offset?: number; startAfter?: string },
  ) {
    const db = this.firestore.firestore;
    let query = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('monitoringRecords')
      .orderBy('recordDate', 'desc');

    if (options?.startAfter) {
      const startDoc = await db
        .collection('tenants')
        .doc(tenantId)
        .collection('clients')
        .doc(clientId)
        .collection('monitoringRecords')
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

  async getMonitoringRecord(
    tenantId: string,
    clientId: string,
    recordId: string,
  ) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('monitoringRecords')
      .doc(recordId)
      .get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreDoc;
  }

  async createMonitoringRecord(
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
      .collection('monitoringRecords')
      .doc();
    const now = new Date();
    await ref.set({ ...record, createdAt: now, updatedAt: now });
    return { id: ref.id };
  }

  async updateMonitoringRecord(
    tenantId: string,
    clientId: string,
    recordId: string,
    patch: Record<string, unknown>,
  ) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('monitoringRecords')
      .doc(recordId)
      .set({ ...patch, updatedAt: new Date() }, { merge: true });
  }

  async deleteMonitoringRecord(
    tenantId: string,
    clientId: string,
    recordId: string,
  ) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('monitoringRecords')
      .doc(recordId)
      .delete();
  }
}
