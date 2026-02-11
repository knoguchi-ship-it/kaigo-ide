# KaigoIDE プロジェクト引継ぎ書

**作成日**: 2026-01-29
**最終更新日**: 2026-02-11
**バージョン**: 0.2.0

---

## 1. プロジェクト概要

### プロダクト名
**KaigoIDE** - 居宅介護支援事業所向け総合業務支援システム

### コンセプト
ケアマネジャーが「ケアプランを設計する」ための統合開発環境（IDE）

### 基本要件
- ブラウザベースのSaaS
- PC / タブレット / スマホ対応（レスポンシブ + PWA）
- モジュール分割による段階的開発

---

## 2. 現在のフェーズ

**Phase 1 (MVP) 開発中 - 主要機能実装完了**

- Monorepo 環境構築済み（pnpm workspaces + Turborepo）
- 認証（JWT + Google OAuth）実装済み
- 支援経過記録（第5表）CRUD + PDF出力 実装済み
- モニタリング評価記録 実装済み
- AI文章生成 実装済み
- Googleカレンダー連携（Calendar API 呼び出し）は未実装

---

## 3. 実装済み機能一覧

### Phase 1 進捗

| 機能 | 状態 | 備考 |
|------|------|------|
| 環境構築（Monorepo + DB） | **完了** | pnpm + Turborepo + Prisma |
| 認証（JWT + Google OAuth） | **完了** | アクセス/リフレッシュトークン |
| 利用者管理（CRUD） | **完了** | テナント分離済み |
| ケアプラン簡易管理 | **完了** | 作成日・版数・目標 |
| 第5表 一般記録 CRUD | **完了** | 6区分 + 検索・フィルタ |
| 第5表 モニタリング評価 | **完了** | 目標別5段階評価 |
| 第5表 AI文章生成 | **完了** | 記録・評価・判断文の生成 |
| 第5表 PDF出力 | **完了** | 厚労省様式・和暦・pdfmake |
| Googleカレンダー連携 | **未実装** | DB保存のみ、Calendar API 未呼び出し |
| 第4表 担当者会議 | **未実装** | Phase 1 スコープだが未着手 |

### ソースコード構成

```
C:\VSCode\CloudePL\kaigoIDE\
├── apps/web/                     # React 18 + Vite フロントエンド
│   └── src/
│       ├── pages/                # ページコンポーネント
│       ├── hooks/                # カスタムフック (TanStack Query)
│       ├── lib/                  # API クライアント
│       ├── features/             # 機能別コンポーネント
│       ├── components/           # 共通UIコンポーネント
│       └── stores/               # Zustand ストア
│
├── services/api/                 # NestJS バックエンド
│   ├── src/
│   │   ├── auth/                 # 認証 (JWT + Google OAuth)
│   │   ├── client/               # 利用者管理
│   │   ├── care-plan/            # ケアプラン簡易管理
│   │   ├── care-record/          # 支援経過記録（第5表）+ PDF出力
│   │   ├── monitoring-record/    # モニタリング評価
│   │   ├── ai/                   # AI文章生成
│   │   ├── pdf/                  # PDF生成共通 (pdfmake + Noto Sans JP)
│   │   └── prisma/               # Prisma ORM
│   ├── prisma/schema.prisma      # DBスキーマ
│   └── assets/fonts/             # 日本語フォント (Noto Sans JP)
│
├── packages/types/               # 共有型定義
├── docs/                         # ドキュメント
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 4. 主要な設計決定

### 4.1 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript 5 + Vite + Tailwind CSS + shadcn/ui |
| 状態管理 | TanStack Query (server) + Zustand (UI) + React Hook Form |
| バックエンド | NestJS 10 + Prisma ORM |
| データベース | PostgreSQL 16（マスタ・設定のみ）|
| 認証 | JWT + Google OAuth 2.0 |
| PDF生成 | pdfmake + Noto Sans JP |
| Monorepo | pnpm workspaces + Turborepo |

### 4.2 Googleカレンダー連携（最重要設計・ADR-0007）

**第5表（支援経過記録）・第4表（担当者会議）はGoogleカレンダーがプライマリデータストア**

> **現状**: 実装では PostgreSQL にデータ保存中。CareRecord に `googleCalendarEventId` カラムは存在するが、Calendar API 呼び出しは未実装。今後の実装で Calendar API と同期する予定。

```
ユーザーのGoogleアカウント
├── KaigoIDE_支援経過記録 （カレンダー）
│   └── イベント: 記録日時で配置
│
└── KaigoIDE_担当者会議 （カレンダー）
    └── イベント: ケアプラン作成日で配置
```

### 4.3 アーキテクチャ方針

- **テナント分離**: 全データアクセスに `tenantId` チェック
- **レイヤー構成**: Controller → Service → Prisma（Repository レイヤーは省略）
- **型共有**: `packages/types` で Frontend/Backend 共通型定義

---

## 5. 未解決の課題・検討事項

### 要検討
| # | 課題 | 状況 |
|---|------|------|
| 1 | Googleカレンダー連携の実装タイミング | PostgreSQL中心で先行開発中 |
| 2 | オフライン時の一時保存方法 | 未検討 |
| 3 | 音声入力APIの選定（Google/Azure/AWS） | 未決定 |
| 4 | 料金体系（月額/従量） | 未決定 |

### 技術的課題
| # | 課題 | 備考 |
|---|------|------|
| 1 | Extended Propertiesの値は最大1024文字 | 長文は本文(description)に格納 |
| 2 | 複雑なデータはJSON格納 | スキーマバージョン管理が必要 |
| 3 | Google APIクォータ | 1,000,000 requests/day |

---

## 6. 次のステップ（推奨）

### 残りの Phase 1 実装
1. Googleカレンダー連携（第5表の記録同期）
2. 第4表（担当者会議）CRUD + PDF出力
3. テンプレート機能（F5-006）

### 品質向上
1. ユニットテスト追加
2. E2Eテスト（Playwright）
3. エラーハンドリングの統一

---

## 7. 重要なポイント（引継ぎ者向け）

1. **Phase 1 主要機能は実装済み** - 第5表CRUD + PDF出力 + モニタリング + AI生成
2. **Googleカレンダー連携は未実装** - ADR-0007の設計方針は維持、段階的に実装予定
3. **担当者会議の日付** - 会議開催日ではなく「ケアプラン作成日」に配置（ADR-0007）
4. **SDD は v0.2.0 に更新済み** - 実装と同期済み
5. **テナント分離** - 全エンドポイントで `tenantId` による分離を確認すること

---

## 8. ドキュメント一覧

```
docs/
├── HANDOVER.md                   ★ この引継ぎ書 (v0.2.0)
├── 00_PROJECT/SOW.md             作業範囲記述書
├── 01_REQUIREMENTS/PRD.md        プロダクト要件定義書
├── 02_DESIGN/SDD.md              ソフトウェア設計書 (v0.2.0 実装同期済み)
├── 03_ADR/
│   ├── 0001〜0006                技術選定ADR
│   └── 0007-google-calendar-integration.md  ★ 最重要
├── GLOSSARY.md                   用語集
├── DOCUMENTATION_STRUCTURE.md    ドキュメント体系
├── SPECIFICATION_DRAFT.md        初期仕様草案
├── index.html                    草案HTML可視化
└── mockup.html                   モックアップ
```

---

## 9. 参考リンク

### 公式資料
- [厚労省 居宅サービス計画書標準様式](https://www.mhlw.go.jp/content/000764680.pdf)
- [厚労省 ケアプランデータ連携標準仕様](https://www.mhlw.go.jp/content/12300000/001316161.pdf)
- [Google Calendar API Extended Properties](https://developers.google.com/workspace/calendar/api/guides/extended-properties)

---

**この引継ぎ書は `docs/HANDOVER.md` に保存されています。**
