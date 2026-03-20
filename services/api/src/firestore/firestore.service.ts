import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

@Injectable()
export class FirestoreService {
  private readonly enabled: boolean;
  private app: App | null = null;
  private db: Firestore | null = null;

  constructor(private readonly config: ConfigService) {
    this.enabled = this.config.get<string>('FIRESTORE_ENABLED') === 'true';
    if (!this.enabled) return;

    const projectId = this.config.get<string>('FIRESTORE_PROJECT_ID');
    const serviceAccountJson = this.config.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    );

    if (getApps().length > 0) {
      this.app = getApp();
    } else if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson) as ServiceAccount;
      this.app = initializeApp({
        credential: cert(credentials),
        projectId: projectId ?? credentials.projectId ?? (credentials as any).project_id,
      });
    } else {
      // Fallback to ADC (Cloud Run/GCE/GKE) when enabled.
      this.app = initializeApp({ projectId });
    }

    this.db = getFirestore(this.app);
  }

  get firestore(): Firestore {
    if (!this.enabled || !this.db) {
      throw new Error('Firestore is not enabled or not initialized.');
    }
    return this.db;
  }
}
