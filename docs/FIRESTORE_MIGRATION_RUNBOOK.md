# Firestore 移行手順（運用ガイド）

## 目的
PostgreSQL → Firestore への段階移行を安全に行うための手順を示す。

## 前提
- 既存 API の入出力は維持
- Firestore を国内リージョンで運用
- 監査ログは Cloud Logging で保持（6ヶ月）

## 1. 準備
- Firestore インデックスを作成（`docs/FIRESTORE_INDEXES_DEPLOY.md`）
- Firestore の権限設計（サービスアカウントのみ書込）
- バックアップ方針を確定

## 2. 移行方針
1) **新規データは Firestore に書き込み**
2) **既存データは段階的に移行**
3) **検証完了後に PostgreSQL を停止**

## 3. 移行作業（概略）
- 移行対象: tenants / users / clients / carePlans / careRecords / monitoringRecords
- 移行時は `tenantId` を必ず保持
- 参照整合性を維持（clientId / carePlanId / createdById）

## 4. 検証
- 一覧/詳細/作成/更新/削除が動作すること
- PDF出力が動作すること
- 監査ログが出力されること

## 5. 切り替え
- PostgreSQL の参照を停止
- Firestore のみで稼働

## 注意
- 移行中は二重書き込み（DB/Firestore）を避ける
- 重要データは必ずバックアップを取得する

