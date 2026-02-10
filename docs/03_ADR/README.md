# Architecture Decision Records (ADR)
# アーキテクチャ決定記録

## ADRとは

Architecture Decision Record (ADR) は、アーキテクチャ上の重要な決定を記録するためのドキュメントです。
各ADRは、1つの決定事項について以下を記録します：

- **何を決定したか** (Decision)
- **なぜそう決定したか** (Context & Rationale)
- **どのような選択肢があったか** (Alternatives)
- **どのような影響があるか** (Consequences)

## ADRの目的

1. **意思決定の透明性**: なぜその技術・設計を選んだのかを明確にする
2. **知識の継承**: 新メンバーが過去の決定理由を理解できる
3. **将来の参照**: 同様の決定が必要になった際の参考になる
4. **決定の追跡**: アーキテクチャの進化を記録する

## ADRのステータス

| ステータス | 説明 |
|-----------|------|
| Proposed | 提案中。レビュー待ち |
| Accepted | 承認済み。実装中または実装済み |
| Deprecated | 非推奨。新規では使用しない |
| Superseded | 別のADRに置き換えられた |

## ADR一覧

| ID | タイトル | ステータス | 日付 |
|----|---------|----------|------|
| [ADR-0001](./0001-use-react-typescript.md) | React + TypeScriptの採用 | Accepted | 2026-01-29 |
| [ADR-0002](./0002-monorepo-structure.md) | モノレポ構成の採用 | Accepted | 2026-01-29 |
| [ADR-0003](./0003-state-management.md) | 状態管理ライブラリの選定 | Accepted | 2026-01-29 |
| [ADR-0004](./0004-backend-framework.md) | バックエンドフレームワークの選定 | Accepted | 2026-01-29 |
| [ADR-0005](./0005-database-selection.md) | データベースの選定 | Accepted | 2026-01-29 |
| [ADR-0006](./0006-authentication-strategy.md) | 認証方式の選定 | Accepted | 2026-01-29 |

## ADRテンプレート

新しいADRを作成する際は、以下のテンプレートを使用してください。

```markdown
# ADR-XXXX: タイトル

**ステータス**: Proposed | Accepted | Deprecated | Superseded
**日付**: YYYY-MM-DD
**決定者**: [名前]

## コンテキスト

[決定が必要になった背景や状況を説明]

## 決定

[何を決定したかを明確に記述]

## 選択肢

### 選択肢1: [名前]
- 概要:
- メリット:
- デメリット:

### 選択肢2: [名前]
- 概要:
- メリット:
- デメリット:

## 決定理由

[なぜこの選択肢を選んだかの理由]

## 影響

### ポジティブな影響
-

### ネガティブな影響
-

### リスクと軽減策
-

## 関連するADR

- ADR-XXXX: [関連するADR]
```

## ファイル命名規則

```
0001-kebab-case-title.md
```

- 4桁の連番
- ケバブケース（単語をハイフンで区切る）
- 簡潔で内容を表すタイトル
