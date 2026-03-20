# Firestore DAO（初期雛形）

## 有効化
`FIRESTORE_ENABLED=true` を設定すると FirestoreService が初期化されます。

## 環境変数（例）
```
FIRESTORE_ENABLED=true
FIRESTORE_PROJECT_ID=your-gcp-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## DAO 一覧
- `TenantDao`
- `UserDao`
- `ClientDao`
- `CarePlanDao`
- `CareRecordDao`
- `MonitoringRecordDao`

## 注意
- DAO は `tenants/{tenantId}` を必ずルートにすること
- `recordDate desc` などは Firestore のインデックスが必要

