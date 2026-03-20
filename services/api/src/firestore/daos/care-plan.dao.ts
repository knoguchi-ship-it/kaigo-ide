import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';
import type { FirestoreDoc } from '../firestore.types';

@Injectable()
export class CarePlanDao {
  constructor(private readonly firestore: FirestoreService) {}

  async listCarePlans(tenantId: string, clientId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('carePlans')
      .orderBy('version', 'desc')
      .get();
    return snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreDoc,
    );
  }

  async getCarePlan(tenantId: string, clientId: string, carePlanId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('carePlans')
      .doc(carePlanId)
      .get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreDoc;
  }

  async createCarePlan(
    tenantId: string,
    clientId: string,
    carePlan: Record<string, unknown>,
  ) {
    const db = this.firestore.firestore;
    const ref = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('carePlans')
      .doc();
    const now = new Date();
    await ref.set({ ...carePlan, createdAt: now, updatedAt: now });
    return { id: ref.id };
  }

  async updateCarePlan(
    tenantId: string,
    clientId: string,
    carePlanId: string,
    patch: Record<string, unknown>,
  ) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('carePlans')
      .doc(carePlanId)
      .set({ ...patch, updatedAt: new Date() }, { merge: true });
  }

  async getLatestCarePlanByClient(tenantId: string, clientId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId)
      .collection('carePlans')
      .orderBy('version', 'desc')
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as FirestoreDoc;
  }
}
