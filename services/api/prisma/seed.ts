import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // テナント作成
  const tenant = await prisma.tenant.create({
    data: { name: 'テスト介護支援事業所' },
  });
  console.log(`Created tenant: ${tenant.name} (${tenant.id})`);

  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      email: 'dev@kaigoidee.local',
      name: '介護 太郎',
      role: 'ADMIN',
      tenantId: tenant.id,
      hashedPassword: crypto.createHash('sha256').update('dev-password').digest('hex'),
    },
  });
  console.log(`Created user: ${user.name} (${user.email})`);

  // 利用者作成
  const client1 = await prisma.client.create({
    data: {
      tenantId: tenant.id,
      familyName: '山田',
      givenName: '太郎',
      familyNameKana: 'ヤマダ',
      givenNameKana: 'タロウ',
      birthDate: new Date('1940-05-15'),
      gender: 'MALE',
      insuranceNumber: '0123456789',
      careLevel: 'CARE_2',
      certificationDate: new Date('2025-04-01'),
      address: '東京都新宿区西新宿1-1-1',
      phone: '03-1234-5678',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      tenantId: tenant.id,
      familyName: '佐藤',
      givenName: '花子',
      familyNameKana: 'サトウ',
      givenNameKana: 'ハナコ',
      birthDate: new Date('1945-08-20'),
      gender: 'FEMALE',
      insuranceNumber: '9876543210',
      careLevel: 'CARE_3',
      certificationDate: new Date('2025-06-01'),
      address: '東京都渋谷区渋谷2-2-2',
      phone: '03-9876-5432',
    },
  });
  console.log(`Created clients: ${client1.familyName} ${client1.givenName}, ${client2.familyName} ${client2.givenName}`);

  // ケアプラン作成
  const plan1 = await prisma.carePlan.create({
    data: {
      clientId: client1.id,
      version: 1,
      createdDate: new Date('2025-04-15'),
      purpose: '自宅での自立した生活を継続する',
    },
  });

  // ケアプラン目標
  const goal1 = await prisma.carePlanGoal.create({
    data: {
      carePlanId: plan1.id,
      type: 'LONG_TERM',
      text: '自宅で安心して生活を続けることができる',
      sortOrder: 1,
    },
  });

  const goal2 = await prisma.carePlanGoal.create({
    data: {
      carePlanId: plan1.id,
      type: 'SHORT_TERM',
      text: '週3回のデイサービスに参加し、身体機能を維持する',
      sortOrder: 2,
    },
  });
  console.log(`Created care plan v${plan1.version} with ${2} goals`);

  // 支援経過記録
  const records = [
    {
      clientId: client1.id,
      recordDate: new Date('2025-05-15T10:30:00'),
      category: 'VISIT' as const,
      content: '自宅を訪問し、本人の体調確認を行う。血圧130/80、食事は3食摂取できている。デイサービスへの参加意欲も高い。',
      professionalJudgment: 'ケアプラン通りサービス継続が適当と判断。次回モニタリングで評価予定。',
      clientFamilyOpinion: '家族より「最近元気が出てきた」とのこと。',
      createdById: user.id,
    },
    {
      clientId: client1.id,
      recordDate: new Date('2025-05-14T14:00:00'),
      category: 'PHONE' as const,
      content: 'デイサービスの担当者と電話で情報共有。本人の最近の様子について確認。入浴は問題なくできているとのこと。',
      createdById: user.id,
    },
    {
      clientId: client1.id,
      recordDate: new Date('2025-05-10T09:00:00'),
      category: 'CONFERENCE' as const,
      content: 'サービス担当者会議を開催。デイサービス・訪問看護の担当者と今後の支援方針について協議。',
      professionalJudgment: '現行サービスを継続し、3ヶ月後に再評価する方針で合意。',
      relatedOrganization: 'ABCデイサービスセンター、DEF訪問看護ステーション',
      createdById: user.id,
    },
  ];

  for (const record of records) {
    await prisma.careRecord.create({ data: record });
  }
  console.log(`Created ${records.length} care records`);

  console.log('\nSeed completed successfully!');
  console.log(`\nLogin with: POST /api/auth/dev-login { "email": "dev@kaigoidee.local" }`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
