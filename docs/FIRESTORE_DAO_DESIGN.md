# Firestore DAO 詳細設計（アクセスパターン対応）

## 目的
- Firestore のコレクション設計と DAO 責務を具体化する
- 既存 API の入出力を保ちつつ、SQL 依存を排除する

## コレクション構成（確定案）
```
tenants/{tenantId}
  users/{userId}
  clients/{clientId}
    carePlans/{carePlanId}
    careRecords/{careRecordId}
    monitoringRecords/{monitoringRecordId}
```

## 主要 DAO と責務

### TenantDao
- `createTenant(name)`
- `getTenant(tenantId)`
- `updateTenant(tenantId, patch)`

### UserDao
- `createUser(tenantId, user)`
- `getUserById(tenantId, userId)`
- `getUserByEmail(tenantId, email)` ※メールはユニーク運用
- `updateUser(tenantId, userId, patch)`

### ClientDao
- `listClients(tenantId, options)`
- `getClient(tenantId, clientId)`
- `createClient(tenantId, client)`
- `updateClient(tenantId, clientId, patch)`
- `deleteClient(tenantId, clientId)`

### CarePlanDao
- `listCarePlans(tenantId, clientId)`
- `getCarePlan(tenantId, clientId, carePlanId)`
- `createCarePlan(tenantId, clientId, carePlan)`
- `updateCarePlan(tenantId, clientId, carePlanId, patch)`
- `getLatestCarePlanByClient(tenantId, clientId)` ※ version 最大を取得

### CareRecordDao
- `listCareRecords(tenantId, clientId, options)` ※ recordDate desc
- `getCareRecord(tenantId, clientId, careRecordId)`
- `createCareRecord(tenantId, clientId, record)`
- `updateCareRecord(tenantId, clientId, careRecordId, patch)`
- `deleteCareRecord(tenantId, clientId, careRecordId)`

### MonitoringRecordDao
- `listMonitoringRecords(tenantId, clientId, options)` ※ recordDate desc
- `getMonitoringRecord(tenantId, clientId, recordId)`
- `createMonitoringRecord(tenantId, clientId, record)`
- `updateMonitoringRecord(tenantId, clientId, recordId, patch)`
- `deleteMonitoringRecord(tenantId, clientId, recordId)`

## アクセスパターン別の設計

### クライアント一覧
- Path: `tenants/{tenantId}/clients`
- Order: `familyNameKana`, `givenNameKana` or `createdAt`
- ページング: `startAfter` + `limit`

### 支援経過記録（第5表）一覧
- Path: `tenants/{tenantId}/clients/{clientId}/careRecords`
- Order: `recordDate desc`
- フィルタ: `category` / `recordDate` 範囲

### モニタリング評価一覧
- Path: `tenants/{tenantId}/clients/{clientId}/monitoringRecords`
- Order: `recordDate desc`

### ケアプラン取得
- Path: `tenants/{tenantId}/clients/{clientId}/carePlans`
- Order: `version desc` で最新を取得

## インデックス要件（想定）
- `careRecords`: `recordDate desc`（複合: `category + recordDate`）
- `monitoringRecords`: `recordDate desc`
- `carePlans`: `version desc`
- `clients`: `familyNameKana asc, givenNameKana asc`（必要時）

## 整合性と冗長化
- `createdByEmail` は冗長化して保存（一覧表示の負荷を削減）
- `goals` / `evaluations` は配列で保存（1MiB 超過時は subcollection 化）
- `version` のユニーク保証はアプリ側で制御

## セキュリティ / テナント分離
- DAO の最上位パスは必ず `tenants/{tenantId}` に固定
- サーバ側で `tenantId` 不一致の場合は 404 を返す

## トランザクション
- CarePlan 作成時の `version` インクリメントはトランザクションで実施
- 重要操作（削除 + 監査ログ追加）はバッチ/トランザクションで整合性確保

