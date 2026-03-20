# Firestore 移行設計（国内リージョン / 準拠優先）

## 目的
- Cloud SQL を使わず、国内リージョンで運用可能なデータストアへ移行する
- 医療・介護のセキュリティガイドライン準拠を前提に、監査・復旧・権限分離を担保する
- 既存の API 機能（第5表のCRUD/PDF/AI）を維持する

## 前提
- リージョン: `asia-northeast1`（国内必須）
- テナント分離: `tenantId` を全データに保持
- 既存の Prisma/PostgreSQL 前提の実装を、Firestore へ置換

## Firestore データモデル（案）
Firestore は JOIN ができないため、参照頻度の高い情報は冗長化する。

### コレクション構成（推奨）
```
tenants/{tenantId}
  users/{userId}
  clients/{clientId}
    carePlans/{carePlanId}
    careRecords/{careRecordId}
    monitoringRecords/{monitoringRecordId}
```

### tenants/{tenantId}
```
{
  name: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### tenants/{tenantId}/users/{userId}
```
{
  email: string,
  name: string,
  role: "ADMIN" | "CARE_MANAGER",
  googleAccessToken?: string,
  googleRefreshToken?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### tenants/{tenantId}/clients/{clientId}
```
{
  familyName: string,
  givenName: string,
  familyNameKana: string,
  givenNameKana: string,
  birthDate: timestamp,
  gender: "MALE" | "FEMALE",
  insuranceNumber: string,
  careLevel: "SUPPORT_1" | "SUPPORT_2" | "CARE_1" | "CARE_2" | "CARE_3" | "CARE_4" | "CARE_5",
  certificationDate: timestamp,
  address?: string,
  phone?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### carePlans/{carePlanId}
```
{
  clientId: string,
  version: number,
  createdDate: timestamp,
  purpose: string,
  goals: [
    { id: string, type: "SHORT_TERM" | "LONG_TERM", text: string, sortOrder: number }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```
- `goals` は配列で保持（サイズが 1MiB を超える場合は subcollection 化）

### careRecords/{careRecordId}
```
{
  clientId: string,
  recordDate: timestamp,
  category: "VISIT" | "PHONE" | "FAX" | "MAIL" | "CONFERENCE" | "OTHER",
  content: string,
  relatedOrganization?: string,
  professionalJudgment?: string,
  clientFamilyOpinion?: string,
  googleCalendarEventId?: string,
  createdById: string,
  createdByEmail: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```
- `createdByEmail` を冗長化（一覧表示の負荷削減）

### monitoringRecords/{monitoringRecordId}
```
{
  clientId: string,
  carePlanId: string,
  recordDate: timestamp,
  overallComment: string,
  professionalJudgment: string,
  nextAction: string,
  googleCalendarEventId?: string,
  createdById: string,
  createdByEmail: string,
  evaluations: [
    { id: string, goalId: string, goalText: string, rating: number, comment: string }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```
- `evaluations` は配列で保持（サイズが 1MiB を超える場合は subcollection 化）

## 主要アクセスパターンとインデックス
- クライアント一覧: `tenants/{tenantId}/clients`（作成日 or 名前順）
- 支援経過記録一覧: `careRecords` を `recordDate desc` で取得
- モニタリング一覧: `monitoringRecords` を `recordDate desc` で取得

インデックス（想定）
- `careRecords`: `recordDate desc`
- `monitoringRecords`: `recordDate desc`
- `carePlans`: `version asc`（ユニーク保証はアプリ側で実装）

## 移行方針
1) Prisma 依存の Repository/Service を Firestore DAO に置換
2) 既存 API の入出力は維持（型は `@kaigo-ide/types` を継続）
3) 監査ログは Cloud Logging に統合（操作ログは別途設計）

## 変更ポイント（コード）
- `services/api/src/**` の Prisma 呼び出しを Firestore Admin SDK に置換
- `db:setup` / `db:migrate` 系スクリプトの再整理
- seed は Firestore への投入スクリプトへ置換

## データ移行
- 既存 PostgreSQL から Firestore へ ETL（後続タスク）
- まずは新規環境から Firestore で動作確認

## 注意点
- Firestore は JOIN 不可のため、アプリ側で冗長化・整合性を担保
- 1 ドキュメント 1MiB 制限に注意
- 書込み頻度が高い場合は分割設計が必要

