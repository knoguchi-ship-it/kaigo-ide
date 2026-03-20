# Firestore Seed 実行手順（運用ガイド）

## 目的
Firestore に初期データを投入し、開発・検証用の動作確認を可能にする。

## 前提
- Firestore が **Native mode** で作成済み
- サービスアカウントJSONを取得済み
- `FIRESTORE_PROJECT_ID` と `FIREBASE_SERVICE_ACCOUNT_JSON` を設定済み

## 1. 環境変数の設定（PowerShell例）
```
$env:FIRESTORE_PROJECT_ID="your-gcp-project-id"
$env:FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

## 2. Seed 実行
```
pnpm --filter @kaigo-ide/api firestore:seed
```

## 3. 出力確認
- `Created tenant: ...`
- `Created user: ...`
- `Created clients: ...`
- `Created care plan: ...`
- `Created N care records`

## 4. 動作確認
```
curl -X POST http://localhost:4000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@kaigoidee.local"}'
```

## 注意
- 本番データには使用しないこと
- 実行ごとに新規テナントが作成される

