# 監査ログ仕様（アプリ側）

## 目的
- 重要操作の追跡性を担保し、医療・介護ガイドライン準拠の監査要件を満たす
- Cloud Logging / Cloud Audit Logs に集約し、外部出力は行わない

## ログ出力方針
- 形式: JSON（1行1イベント）
- 送信先: 標準出力（Cloud Run で Cloud Logging に集約）
- 個人情報は最小化し、必要ならマスキング

## 共通フィールド
```
{
  "eventType": "string",
  "timestamp": "ISO8601",
  "tenantId": "string",
  "userId": "string",
  "userEmail": "string",
  "role": "ADMIN | CARE_MANAGER",
  "clientId": "string | null",
  "resourceId": "string | null",
  "result": "SUCCESS | FAIL",
  "reason": "string | null",
  "ip": "string",
  "userAgent": "string"
}
```

## イベント種別（最低限）
- `AUTH_LOGIN`
- `AUTH_LOGOUT`
- `AUTH_REFRESH`
- `CLIENT_CREATE`
- `CLIENT_UPDATE`
- `CLIENT_DELETE`
- `CARE_RECORD_CREATE`
- `CARE_RECORD_UPDATE`
- `CARE_RECORD_DELETE`
- `MONITORING_RECORD_CREATE`
- `MONITORING_RECORD_UPDATE`
- `MONITORING_RECORD_DELETE`
- `CARE_PLAN_CREATE`
- `CARE_PLAN_UPDATE`
- `ROLE_DENIED`（権限エラー）
- `AUTH_FAILED`（認証失敗）

## 監査ログ保持
- 保持期間: **6ヶ月**
- 管理者閲覧権限のみ付与
