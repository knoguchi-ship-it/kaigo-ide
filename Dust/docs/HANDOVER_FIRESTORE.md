# Firestore移行 作業メモ（スレッド引継ぎ用）

## 現在地（完了済み）
- Firestore DAO 雛形作成（tenant/user/client/care-plan/care-record/monitoring-record）
- Prisma依存の主要Serviceを DAO 置換
- 監査ログ（Cloud Logging）実装 + 401/403 監査
- Firestore seed スクリプト追加
- Firestoreインデックス定義 + デプロイ手順ドキュメント化

## 追加ドキュメント
- `docs/FIRESTORE_MIGRATION.md`（モデル案）
- `docs/FIRESTORE_DAO_DESIGN.md`（DAO設計）
- `docs/FIRESTORE_MIGRATION_TASKS.md`（タスク分解）
- `docs/FIRESTORE_INDEXES_DEPLOY.md`（インデックス手順）
- `docs/FIRESTORE_SEED_RUNBOOK.md`（seed手順）
- `docs/FIRESTORE_MIGRATION_RUNBOOK.md`（移行手順）
- `docs/SECURITY_COMPLIANCE_CHECKLIST.md`（準拠チェック）
- `docs/AUDIT_LOG_SPEC.md`（監査ログ仕様）

## 重要な実装変更
- `services/api/src/*` の主要Serviceが Firestore DAO を利用
- 監査ログは stdout JSON で出力（Cloud Run → Cloud Logging）
- `req.auditContext` に ip/userAgent を付与する interceptor を追加
- Prisma enum 依存を排除（`services/api/src/common/enums.ts`）

## 未実施 / 要確認
- 回帰テスト未実施（起動・CRUD・PDF出力・AI生成）
- Firestoreの `keyword` 検索は簡易フィルタ（contains未対応）
- Firestoreインデックスの実デプロイ未実施
- DTOのenum変更に伴うフロントの整合性は要確認

## 次にやること（優先順）
1) 回帰テスト（API起動→CRUD→PDF→AI）
2) Firestoreインデックスの実デプロイ
3) 検索要件が必要なら全文検索基盤を検討

