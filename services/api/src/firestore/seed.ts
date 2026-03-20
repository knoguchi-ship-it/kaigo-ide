import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

function initFirestore() {
  if (getApps().length > 0) return getFirestore();

  const projectId = process.env.FIRESTORE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const credentials = JSON.parse(serviceAccountJson);
    initializeApp({
      credential: cert(credentials),
      projectId: projectId ?? credentials.project_id,
    });
  } else {
    initializeApp({ projectId });
  }

  return getFirestore();
}

async function main() {
  console.log('Seeding Firestore...');
  const db = initFirestore();

  const tenantRef = db.collection('tenants').doc();
  const tenantId = tenantRef.id;
  const now = new Date();
  await tenantRef.set({
    name: 'テスト介護支援事業所',
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created tenant: ${tenantId}`);

  const userRef = db.collection('tenants').doc(tenantId).collection('users').doc();
  const userId = userRef.id;
  await userRef.set({
    tenantId,
    userId,
    email: 'dev@kaigoidee.local',
    name: '介護 太郎',
    role: 'ADMIN',
    hashedPassword: crypto.createHash('sha256').update('dev-password').digest('hex'),
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created user: ${userId}`);

  const clientRef1 = db.collection('tenants').doc(tenantId).collection('clients').doc();
  const clientId1 = clientRef1.id;
  await clientRef1.set({
    tenantId,
    familyName: '山田',
    givenName: '太郎',
    familyNameKana: 'ヤマダ',
    givenNameKana: 'タロウ',
    birthDate: new Date('1940-05-15'),
    gender: 'MALE',
    insuranceNumber: '0123456789',
    careLevel: 'CARE_2',
    certificationDate: new Date('2025-04-01'),
    address: '東京都千代田区1-1-1',
    phone: '03-1234-5678',
    createdAt: now,
    updatedAt: now,
  });

  const clientRef2 = db.collection('tenants').doc(tenantId).collection('clients').doc();
  const clientId2 = clientRef2.id;
  await clientRef2.set({
    tenantId,
    familyName: '佐藤',
    givenName: '花子',
    familyNameKana: 'サトウ',
    givenNameKana: 'ハナコ',
    birthDate: new Date('1945-08-20'),
    gender: 'FEMALE',
    insuranceNumber: '9876543210',
    careLevel: 'CARE_3',
    certificationDate: new Date('2025-06-01'),
    address: '東京都港区2-2-2',
    phone: '03-9876-5432',
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created clients: ${clientId1}, ${clientId2}`);

  const carePlanRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('clients')
    .doc(clientId1)
    .collection('carePlans')
    .doc();
  const carePlanId = carePlanRef.id;
  const goals = [
    {
      id: db.collection('_ids').doc().id,
      carePlanId,
      type: 'LONG_TERM',
      text: '自立した生活の維持・改善',
      sortOrder: 1,
    },
    {
      id: db.collection('_ids').doc().id,
      carePlanId,
      type: 'SHORT_TERM',
      text: '週3回のデイサービス利用',
      sortOrder: 2,
    },
  ];
  await carePlanRef.set({
    tenantId,
    clientId: clientId1,
    version: 1,
    createdDate: new Date('2025-04-15'),
    purpose: '安全で自立した生活の継続',
    goals,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created care plan: ${carePlanId}`);

  const records = [
    {
      clientId: clientId1,
      recordDate: new Date('2025-05-15T10:30:00'),
      category: 'VISIT',
      content: '訪問し、健康状態を確認。血圧130/80、体温36.3。デイサービスへの意欲を確認。',
      professionalJudgment: 'デイサービス継続が有効。継続的なモニタリングが必要。',
      clientFamilyOpinion: '家族からは体調安定の報告。',
      createdById: userId,
    },
    {
      clientId: clientId1,
      recordDate: new Date('2025-05-14T14:00:00'),
      category: 'PHONE',
      content: '電話連絡で体調確認。最近の睡眠状況は良好。',
      createdById: userId,
    },
    {
      clientId: clientId1,
      recordDate: new Date('2025-05-10T09:00:00'),
      category: 'CONFERENCE',
      content: 'デイサービス担当者会議で状況共有。',
      professionalJudgment: '今後もサービス継続。',
      relatedOrganization: 'ABCデイサービスセンター',
      createdById: userId,
    },
  ];

  for (const record of records) {
    const ref = db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .doc(clientId1)
      .collection('careRecords')
      .doc();
    await ref.set({
      tenantId,
      clientId: record.clientId,
      recordDate: record.recordDate,
      category: record.category,
      content: record.content,
      relatedOrganization: record.relatedOrganization,
      professionalJudgment: record.professionalJudgment,
      clientFamilyOpinion: record.clientFamilyOpinion,
      createdById: record.createdById,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`Created ${records.length} care records`);

  console.log('Firestore seed completed.');
  console.log('Login: POST /api/auth/dev-login { "email": "dev@kaigoidee.local" }');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
