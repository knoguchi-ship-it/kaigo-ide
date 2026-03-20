import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';
import type { FirestoreDoc } from '../firestore.types';

@Injectable()
export class ClientDao {
  constructor(private readonly firestore: FirestoreService) {}

  async listClients(
    tenantId: string,
    options?: { limit?: number; startAfter?: string },
  ) {
    const db = this.firestore.firestore;
    let query = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .orderBy('familyNameKana')
      .orderBy('givenNameKana');

    if (options?.startAfter) {
      const startDoc = await db
        .collection('tenants')
        .doc(tenantId)
        .collection('clients')
        .doc(options.startAfter)
        .get();
      if (startDoc.exists) query = query.startAfter(startDoc);
    }

    if (options?.limit) query = query.limit(options.limit);

    const snap = await query.get();
    return snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreDoc,
    );
  }

  async getClient(tenantId: string, clientId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreDoc;
  }

  async createClient(tenantId: string, client: Record<string, unknown>) {
    const db = this.firestore.firestore;
    const ref = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc();
    const now = new Date();
    await ref.set({ ...client, createdAt: now, updatedAt: now });
    return { id: ref.id };
  }

  async updateClient(
    tenantId: string,
    clientId: string,
    patch: Record<string, unknown>,
  ) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .set({ ...patch, updatedAt: new Date() }, { merge: true });
  }

  async deleteClient(tenantId: string, clientId: string) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .delete();
  }
}
