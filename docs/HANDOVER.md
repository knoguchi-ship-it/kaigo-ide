# KaigoIDE 引き継ぎ書

**更新日**: 2026-03-20  
**正本**: このファイル

## グランドルール

このリポジトリの最上位ルールは [docs/00_PROJECT/PROJECT_GROUND_RULES.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/PROJECT_GROUND_RULES.md) です。
文字コード方針の正本は [docs/00_PROJECT/ENCODING_POLICY.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/ENCODING_POLICY.md) です。
ドキュメントサイト計画の正本は [docs/00_PROJECT/DOCUMENT_SITE_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/DOCUMENT_SITE_PLAN.md) です。
GitHub Pages 公開計画の正本は [docs/00_PROJECT/GITHUB_PAGES_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_PLAN.md) です。
GitHub Pages 設定手順書は [docs/00_PROJECT/GITHUB_PAGES_SETUP_RUNBOOK.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_SETUP_RUNBOOK.md) です。

次の担当者は着手前に必ず確認してください。

- 最新情報の Web 調査
- 根拠付きの提案
- 明示承認後の実装
- ドキュメント先行更新
- 誤解のない handover

## 現在地

- 現行 API は Firestore DAO ベースです
- 実装済み:
  - 認証
  - 利用者管理
  - ケアプラン簡易管理
  - 支援経過記録（第5表）
  - モニタリング入力 API
  - AI 生成 API
- 未実装:
  - 担当者会議（第4表）
  - Google Calendar 同期
  - モニタリング一覧 / 編集 / 削除 UI
  - OpenAPI 正本化
  - 自動テスト
- GCP を主軸にしています
- AI 方針:
  - 開発 / 個人運用 / 匿名化データ: `Gemini Developer API`
  - 本番 / 実データ / センシティブ情報: `Vertex AI`

## 読み方

- `README.md`: 現行実装の概要と起動手順
- `docs/HANDOVER.md`: 現在地の正本
- `docs/HANDOVER_CURRENT.md`: 差分だけを短く見たいときのメモ
- `docs/01_REQUIREMENTS/PRD.md`: target state を含む要件書
- `docs/02_DESIGN/SDD.md`: target state を含む設計書

## 実装済み API

- Auth: `dev-login` / Google OAuth / refresh / me
- Client: CRUD
- CarePlan: list / get / create
- CareRecord: list / get / create / update / delete / PDF export
- MonitoringRecord: list / get / create
- AI: status / generate / generate/stream

## 実装済み画面

- Login
- Auth callback
- Dashboard
- 利用者一覧
- 支援経過記録の新規作成
- モニタリング入力

## AI 設定

### 開発向け

- `AI_PROVIDER=gemini`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_API_ENDPOINT`

### 本番向け

- `AI_PROVIDER=vertex`
- `VERTEX_AI_PROJECT_ID`
- `VERTEX_AI_LOCATION`
- `VERTEX_AI_MODEL`
- `VERTEX_AI_API_ENDPOINT`
- `DEV_LOGIN_ENABLED=false`
- `FIREBASE_SERVICE_ACCOUNT_JSON` または `GOOGLE_SERVICE_ACCOUNT_JSON`
- Cloud Run 上ではメタデータ認証でも可

## 検証結果

1. `pnpm build` は成功
2. `pnpm test` は失敗
3. 失敗理由は回帰ではなくテスト未整備

## 運用ルール

1. 個人開発では Gemini Developer API を使ってよい
2. Gemini 利用時は匿名化データのみを前提にする
3. 実データを AI に送る運用は Vertex AI へ切り替えてから行う
4. Firestore と Vertex AI の GCP プロジェクトは原則そろえる
5. production では `DEV_LOGIN_ENABLED=false` を維持する

## 追加した本番足場

1. [services/api/.env.production.example](C:/VSCode/CloudePL/kaigoIDE/services/api/.env.production.example)
2. 起動時の環境変数バリデーション
3. `DEV_LOGIN_ENABLED` による開発ログインの明示制御

## 追加したドキュメント運用足場

1. [docs/00_PROJECT/DOCUMENT_SITE_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/DOCUMENT_SITE_PLAN.md)
2. [docs/00_PROJECT/GITHUB_PAGES_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_PLAN.md)
3. [docs/00_PROJECT/GITHUB_PAGES_SETUP_RUNBOOK.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_SETUP_RUNBOOK.md)
4. [docs/site/index.html](C:/VSCode/CloudePL/kaigoIDE/docs/site/index.html)
5. [docs/site/governance/index.html](C:/VSCode/CloudePL/kaigoIDE/docs/site/governance/index.html)
6. [docs/site/encoding/index.html](C:/VSCode/CloudePL/kaigoIDE/docs/site/encoding/index.html)
7. [docs/site/handover/index.html](C:/VSCode/CloudePL/kaigoIDE/docs/site/handover/index.html)
8. [docs/site/architecture/index.html](C:/VSCode/CloudePL/kaigoIDE/docs/site/architecture/index.html)
9. [docs/site/operations/index.html](C:/VSCode/CloudePL/kaigoIDE/docs/site/operations/index.html)
10. [docs/site/assets/css/site.css](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/css/site.css)
11. [docs/site/assets/img/github-pages-public-404.png](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-public-404.png)
12. [docs/site/assets/img/github-pages-site-not-found.png](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-site-not-found.png)
13. [.editorconfig](C:/VSCode/CloudePL/kaigoIDE/.editorconfig)
14. [.gitattributes](C:/VSCode/CloudePL/kaigoIDE/.gitattributes)
15. [.github/workflows/pages.yml](C:/VSCode/CloudePL/kaigoIDE/.github/workflows/pages.yml)

## 文字コード状況

1. Markdown の主要文書は UTF-8 で保存されている
2. Windows PowerShell 5.1 + code page 932 環境では、表示だけ文字化けすることがある
3. 一部の API サービスには、例外メッセージ文字列の実ファイル破損が残っている
4. 詳細は [ENCODING_POLICY.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/ENCODING_POLICY.md) を参照

## 次に揃えるべき項目

1. OpenAPI を API 契約の正本にする
2. 認証トークンを `localStorage` から cookie ベースへ移す
3. Firestore の一覧系を cursor pagination に寄せる
4. モニタリング一覧 / 編集 / 削除 UI を追加する
5. 自動テストを追加する
6. 文字化けした例外メッセージを修復する
7. 既存ファイル全体の文字コード / 行末を再確認する
8. ドキュメントサイトのパンくず / セクション導線を追加する
9. GitHub Pages の repository 設定で source を `GitHub Actions` に切り替える
10. GitHub ログイン済みセッションで `Settings > Pages` を開き、Playwright で再確認する

## 次担当者チェックリスト

1. [docs/00_PROJECT/PROJECT_GROUND_RULES.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/PROJECT_GROUND_RULES.md) を読む
2. 実行日時点の最新情報を Web で確認する
3. 提案を出して承認を取る
4. ドキュメントを先に更新する
5. 実装後に検証結果と handover を更新する
