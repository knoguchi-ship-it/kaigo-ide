# KaigoIDE ドキュメント体系

## ドキュメント全体構成

```
docs/
├── 00_PROJECT/                      # プロジェクト管理
│   ├── SOW.md                       # Statement of Work（作業範囲記述書）
│   ├── PROJECT_CHARTER.md           # プロジェクト憲章
│   └── STAKEHOLDERS.md              # ステークホルダー一覧
│
├── 01_REQUIREMENTS/                 # 要件定義
│   ├── PRD.md                       # Product Requirements Document
│   ├── USER_STORIES/                # ユーザーストーリー
│   │   ├── epic-care-record.md      # 支援経過記録エピック
│   │   ├── epic-conference.md       # 担当者会議エピック
│   │   └── ...
│   ├── USE_CASES/                   # ユースケース
│   └── NON_FUNCTIONAL_REQUIREMENTS.md  # 非機能要件
│
├── 02_DESIGN/                       # 設計ドキュメント
│   ├── SDD.md                       # Software Design Document（総合設計書）
│   ├── ARCHITECTURE.md              # システムアーキテクチャ
│   ├── API_SPECIFICATION.md         # API仕様書
│   ├── DATABASE_DESIGN.md           # データベース設計
│   ├── UI_SPECIFICATION/            # UI仕様
│   │   ├── WIREFRAMES.md
│   │   └── DESIGN_SYSTEM.md
│   └── SECURITY_DESIGN.md           # セキュリティ設計
│
├── 03_ADR/                          # Architecture Decision Records
│   ├── README.md                    # ADR一覧・索引
│   ├── 0001-use-react-typescript.md
│   ├── 0002-monorepo-structure.md
│   ├── 0003-state-management.md
│   └── ...
│
├── 04_DEVELOPMENT/                  # 開発ガイド
│   ├── CONTRIBUTING.md              # コントリビューションガイド
│   ├── CODING_STANDARDS.md          # コーディング規約
│   ├── GIT_WORKFLOW.md              # Gitワークフロー
│   ├── TESTING_STRATEGY.md          # テスト戦略
│   └── CI_CD.md                     # CI/CDパイプライン
│
├── 05_OPERATIONS/                   # 運用ドキュメント
│   ├── DEPLOYMENT.md                # デプロイ手順
│   ├── MONITORING.md                # 監視設計
│   ├── INCIDENT_RESPONSE.md         # インシデント対応
│   └── BACKUP_RECOVERY.md           # バックアップ・リカバリ
│
├── 06_USER/                         # ユーザー向けドキュメント
│   ├── USER_MANUAL.md               # ユーザーマニュアル
│   ├── ADMIN_GUIDE.md               # 管理者ガイド
│   └── FAQ.md                       # よくある質問
│
├── CHANGELOG.md                     # 変更履歴
├── GLOSSARY.md                      # 用語集
└── SPECIFICATION_DRAFT.md           # 仕様草案（現在のファイル）
```

---

## 各ドキュメントの役割と優先度

### Tier 1: 必須（プロジェクト開始前に作成）

| ドキュメント | 役割 | 対象読者 |
|-------------|------|----------|
| **SOW** | プロジェクトの作業範囲、成果物、スケジュール、責任分担を定義 | 経営層、PM、開発チーム |
| **PRD** | プロダクトの目的、機能要件、ユーザー価値を定義 | PO、デザイナー、開発チーム |
| **SDD** | システム全体の設計方針、アーキテクチャ、コンポーネント構成を定義 | アーキテクト、開発チーム |
| **ADR** | 重要なアーキテクチャ決定の理由と背景を記録 | 開発チーム、将来の保守担当 |

### Tier 2: 重要（開発フェーズで作成）

| ドキュメント | 役割 | 対象読者 |
|-------------|------|----------|
| **API仕様書** | REST API/GraphQLのエンドポイント、リクエスト/レスポンス仕様 | フロント/バックエンド開発者 |
| **DB設計書** | ER図、テーブル定義、インデックス設計 | バックエンド開発者、DBA |
| **コーディング規約** | コードスタイル、命名規則、ベストプラクティス | 開発チーム全員 |
| **テスト戦略** | テストの種類、カバレッジ目標、テスト環境 | QA、開発チーム |

### Tier 3: 推奨（段階的に整備）

| ドキュメント | 役割 | 対象読者 |
|-------------|------|----------|
| **ユーザーストーリー** | 機能をユーザー視点で記述 | PO、開発チーム |
| **運用マニュアル** | デプロイ、監視、障害対応手順 | インフラ、運用チーム |
| **ユーザーマニュアル** | エンドユーザー向け操作説明 | 介護支援専門員 |
| **CHANGELOG** | バージョンごとの変更履歴 | 全ステークホルダー |

---

## アジャイル開発でのドキュメント運用方針

### 基本原則
1. **Living Document**: ドキュメントは生き物。スプリントごとに更新
2. **Just Enough**: 必要最小限の情報を記載。過度な詳細化は避ける
3. **Code as Documentation**: コードで表現できることはコードで
4. **Why over How**: 「なぜ」を重視。「どのように」はコードを参照

### 更新タイミング
| イベント | 更新対象 |
|----------|----------|
| スプリント開始 | PRD（該当機能部分）、ユーザーストーリー |
| 設計レビュー時 | SDD、ADR（新規決定時） |
| 実装完了時 | API仕様書、DB設計書 |
| リリース時 | CHANGELOG、ユーザーマニュアル |

### バージョン管理
- 全ドキュメントをGitで管理
- Markdownを基本フォーマットとして採用
- 図表はMermaid/PlantUMLで記述（差分管理可能）

---

## 参考リソース

- [Atlassian - SOW Template](https://www.atlassian.com/software/confluence/templates/statement-of-work)
- [GitHub - ADR Examples](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Atlassian - Software Design Document](https://www.atlassian.com/work-management/knowledge-sharing/documentation/software-design-document)
- [Product School - PRD Template](https://productschool.com/blog/product-strategy/product-template-requirements-document-prd)
