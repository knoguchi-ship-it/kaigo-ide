# KaigoIDE

介護支援専門員向けの記録支援アプリです。

## グランドルール

このリポジトリは [docs/00_PROJECT/PROJECT_GROUND_RULES.md](docs/00_PROJECT/PROJECT_GROUND_RULES.md) を最上位ルールとして運用する。

開発者および AI エージェントを含む全ての貢献者は、この文書に従わなければならない。

文字コード方針の正本は [docs/00_PROJECT/ENCODING_POLICY.md](docs/00_PROJECT/ENCODING_POLICY.md) です。

## 現在の実装方針

- バックエンドの現行データストアは Firestore です
- 支援経過記録（第5表）、利用者管理、ケアプラン簡易管理、モニタリング入力、認証、AI 生成 API を実装済みです
- 担当者会議（第4表）と Google Calendar 同期は未実装です
- GCP を主軸にしています
- AI は `dev/personal = Gemini Developer API`、`target/prod = Vertex AI` の方針です
- 個人運用は Firestore と Gemini Developer API の無料枠から始め、実データ運用では Vertex AI へ切り替える前提です

## 技術スタック

| Layer | Stack |
|------|------|
| Frontend | React 18 + TypeScript 5 + Vite + Tailwind CSS |
| State | TanStack Query + Zustand + React Hook Form |
| Backend | NestJS 10 |
| Data | Firestore (`firebase-admin`) |
| Auth | JWT + Google OAuth 2.0 + devLogin |
| AI | Gemini Developer API (dev) / Vertex AI (prod target) |
| PDF | pdfmake + Noto Sans JP |
| Monorepo | pnpm workspaces + Turborepo |

## セットアップ

### 前提

- Node.js 20+
- pnpm 10+
- Firestore を使う GCP プロジェクト

### 開発起動

```bash
pnpm install
cp services/api/.env.example services/api/.env
pnpm --filter @kaigo-ide/api firestore:seed
pnpm dev
```

最低限の設定例:

```env
FIRESTORE_ENABLED=true
FIRESTORE_PROJECT_ID=<your-gcp-project-id>
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
JWT_SECRET=<development-secret>
CORS_ORIGIN=http://localhost:3000
DEV_LOGIN_ENABLED=true
AI_PROVIDER=gemini
GEMINI_API_KEY=<google-ai-api-key>
```

### AI の使い分け

- 個人開発、検証、匿名化データ: `AI_PROVIDER=gemini`
- 実データ、本番運用、センシティブ情報: `AI_PROVIDER=vertex`

Vertex AI に切り替える例:

```env
AI_PROVIDER=vertex
VERTEX_AI_PROJECT_ID=<your-gcp-project-id>
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-2.5-flash
DEV_LOGIN_ENABLED=false
```

`FIREBASE_SERVICE_ACCOUNT_JSON` は Vertex AI の認証にも利用できます。必要なら `GOOGLE_SERVICE_ACCOUNT_JSON` で上書きします。
Cloud Run などの GCP ランタイムでは、サービスアカウント JSON を置かずにメタデータ認証を使う構成も可能です。

### 本番テンプレート

- API 本番テンプレート: [services/api/.env.production.example](services/api/.env.production.example)
- production では `DEV_LOGIN_ENABLED=false` を必須にしています
- 起動時に環境変数バリデーションが走るため、`Vertex AI` 必須項目や危険な dev 設定が残っていると起動に失敗します

### 開発ログイン

```bash
curl -X POST http://localhost:4000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@kaigoidee.local"}'
```

返却された `accessToken` を `Authorization: Bearer <token>` に設定してください。

## API

ベース URL は `http://localhost:4000/api` です。

### AI

| Method | Path | Notes |
|------|------|------|
| GET | `/ai/status` | `enabled`, `provider`, `model`, `targetProvider` などを返します |
| POST | `/ai/generate` | AI 文章生成 |
| POST | `/ai/generate/stream` | SSE ストリーム生成 |

## 検証状況

- `pnpm build` は成功しています
- `pnpm test` は現在失敗します
  - 理由: `@kaigo-ide/api` に自動テストが未整備です

## ドキュメント

- 現在地の正本: [docs/HANDOVER.md](docs/HANDOVER.md)
- 差分メモ: [docs/HANDOVER_CURRENT.md](docs/HANDOVER_CURRENT.md)
- 文字コード方針: [docs/00_PROJECT/ENCODING_POLICY.md](docs/00_PROJECT/ENCODING_POLICY.md)
- ドキュメントサイト計画: [docs/00_PROJECT/DOCUMENT_SITE_PLAN.md](docs/00_PROJECT/DOCUMENT_SITE_PLAN.md)
- GitHub Pages 公開計画: [docs/00_PROJECT/GITHUB_PAGES_PLAN.md](docs/00_PROJECT/GITHUB_PAGES_PLAN.md)
- ドキュメントサイト入口: [docs/site/index.html](docs/site/index.html)
- 引き継ぎページ: [docs/site/handover/index.html](docs/site/handover/index.html)
- 要件書: [docs/01_REQUIREMENTS/PRD.md](docs/01_REQUIREMENTS/PRD.md)
- 設計書: [docs/02_DESIGN/SDD.md](docs/02_DESIGN/SDD.md)

## 注意

- `README.md` と `docs/HANDOVER.md` を現行実装の正本にしています
- `PRD.md` と `SDD.md` は target state を含む文書です
- PostgreSQL / Prisma は移行資産として残っていますが、現行 API の主経路では使っていません
- 文字コードと改行の標準化設定として [`.editorconfig`](.editorconfig) と [`.gitattributes`](.gitattributes) を追加済みです
