# Firestore 移行タスク分解（実装計画）

## 0. 前提
- DB: Firestore（asia-northeast1）
- 監査ログ: Cloud Logging / Cloud Audit Logs（保持 6ヶ月）
- 既存 API の入出力は維持（@kaigo-ide/types）

## 1. 設計フェーズ
1) **データモデル確定**
   - `docs/FIRESTORE_MIGRATION.md` のモデル案をレビュー
   - 1MiB 制限に抵触しないことを確認
2) **アクセスパターン定義**
   - 一覧・検索・並び順・ページング方式を確定
3) **インデックス定義**
   - `recordDate desc` 等の必須インデックスを洗い出し
4) **整合性戦略**
   - 冗長化項目（createdByEmail 等）の更新ルールを定義

## 2. 実装フェーズ（API）
1) **Firestore SDK 導入**
   - `firebase-admin` の導入
   - サービスアカウント認証の実装（Secret Manager 連携は後工程）
2) **DAO 層の追加**
   - `services/api/src/firestore/` を新設
   - `TenantDao / UserDao / ClientDao / CarePlanDao / CareRecordDao / MonitoringRecordDao`
3) **既存 Service の置換**
   - Prisma 呼び出しを DAO に置換
   - トランザクションが必要な箇所は Firestore トランザクションで実装
4) **API テスト**
   - 既存 API が変更なく動くか確認
   - `tenantId` 分離が崩れていないか確認

## 3. 実装フェーズ（監査ログ）
1) **操作ログの定義**
   - 認証、主要 CRUD、権限エラーのログを定義
2) **ログ出力統一**
   - ログ形式（JSON）を固定
   - PII をマスキングして出力

## 4. 移行フェーズ
1) **Seed スクリプトの置換**
   - `services/api/prisma/seed.ts` を Firestore seed に変更
2) **データ移行計画**
   - PostgreSQL → Firestore の移行手順を作成
   - 初期移行は手動 or バッチで段階的に

## 5. 運用準備
1) **監査ログ保持設定（6ヶ月）**
2) **障害対応 / 復旧手順の作成**
3) **運用規程（最小版）作成**

## 6. 検証
- CRUD / PDF / AI / 認証の回帰確認
- 監査ログが想定通り出力されること
- 負荷試験（小規模）と無料枠超過リスクの概算

## 7. 依存関係
- Firestore SDK 導入 → DAO 実装 → Service 置換 → Seed → テスト
- 監査ログは Service 置換と並行可能

