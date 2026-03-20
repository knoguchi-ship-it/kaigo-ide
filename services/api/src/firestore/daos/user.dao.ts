import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';
import type { FirestoreDoc } from '../firestore.types';

@Injectable()
export class UserDao {
  constructor(private readonly firestore: FirestoreService) {}

  async createUser(
    tenantId: string,
    user: Record<string, unknown>,
  ): Promise<{ id: string }> {
    const db = this.firestore.firestore;
    const ref = db
      .collection('tenants')
      .doc(tenantId)
      .collection('users')
      .doc();
    const now = new Date();
    await ref.set({
      ...user,
      tenantId,
      userId: ref.id,
      createdAt: now,
      updatedAt: now,
    });
    return { id: ref.id };
  }

  async getUserById(tenantId: string, userId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('users')
      .doc(userId)
      .get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreDoc;
  }

  async getUserByEmail(tenantId: string, email: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as FirestoreDoc;
  }

  async updateUser(
    tenantId: string,
    userId: string,
    patch: Record<string, unknown>,
  ) {
    const db = this.firestore.firestore;
    await db
      .collection('tenants')
      .doc(tenantId)
      .collection('users')
      .doc(userId)
      .set({ ...patch, updatedAt: new Date() }, { merge: true });
  }

  async getUserByEmailAnyTenant(email: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collectionGroup('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async getUserByIdAnyTenant(userId: string) {
    const db = this.firestore.firestore;
    const snap = await db
      .collectionGroup('users')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as FirestoreDoc;
  }
}
