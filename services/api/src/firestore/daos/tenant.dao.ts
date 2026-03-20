import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';
import type { FirestoreDoc } from '../firestore.types';

@Injectable()
export class TenantDao {
  constructor(private readonly firestore: FirestoreService) {}

  async createTenant(name: string) {
    const db = this.firestore.firestore;
    const ref = db.collection('tenants').doc();
    const now = new Date();
    await ref.set({
      name,
      createdAt: now,
      updatedAt: now,
    });
    return { id: ref.id, name };
  }

  async getTenant(tenantId: string) {
    const db = this.firestore.firestore;
    const snap = await db.collection('tenants').doc(tenantId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreDoc;
  }

  async updateTenant(tenantId: string, patch: Record<string, unknown>) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .set({ ...patch, updatedAt: new Date() }, { merge: true });
  }
}
