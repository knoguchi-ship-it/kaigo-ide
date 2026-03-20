# ドキュメントサイト計画

最終更新日: 2026-03-20  
位置付け: 正本  
関連ルール:
- [PROJECT_GROUND_RULES.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/PROJECT_GROUND_RULES.md)
- [ENCODING_POLICY.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/ENCODING_POLICY.md)
- [GITHUB_PAGES_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_PLAN.md)

## 目的

この文書は、本リポジトリ内のドキュメントを、人が直感的に理解できる 1 つの静的サイトとして再構成するための方針を定義する。

## 目指す姿

最終的に、`docs/site/` 配下の HTML 群が相互に接続され、単体のドキュメントサイトとして成立している状態を目指す。

要件:
- 主要ページが共通ナビゲーションでつながる
- 各ページが単独でも意味を持つ
- 既存 Markdown 文書の正本を参照できる
- UTF-8 前提で安定表示できる
- デスクトップとモバイルの双方で読める
- 将来的に GitHub Pages へ載せやすい
- GitHub Pages 公開時にもリンクが破綻しない

## 採用方針

### 1. 現段階では静的 HTML を採用する

現段階では、Jekyll や Docusaurus などのビルド型仕組みは導入しない。

理由:
- 導入コストを抑えられる
- 文字コード問題の切り分けが容易
- GitHub Pages との相性がよい
- リポジトリ内の正本ドキュメントと並行運用しやすい

### 2. 正本は Markdown に残す

要件、設計、運用、引き継ぎの正本は Markdown に残す。
HTML は「人が読みやすい導線」と「視覚的整理」の役割を担う。

### 3. まずは小さく始めて、相互接続を優先する

Phase 1 では、以下のページを初期実装対象とする。
- `docs/site/index.html`
- `docs/site/governance/index.html`
- `docs/site/encoding/index.html`
- `docs/site/handover/index.html`
- `docs/site/architecture/index.html`
- `docs/site/operations/index.html`

## 情報設計

### グローバルナビゲーション

全ページで共通化する項目:
- ホーム
- ガバナンス
- 文字コード
- 引き継ぎ
- 設計 / 運用

Phase 1 では、主要ページの相互接続を優先する。

### ホームページ

役割:
- サイト全体の入口
- 現在地の要約
- 主要文書への導線
- 優先課題の表示

### ガバナンスページ

役割:
- グランドルールの要約
- 標準作業順序の説明
- docs-first / proposal-first / approval-first の説明

### 文字コードページ

役割:
- 文字化けの種類の説明
- 原因の切り分け
- 修復対象の明示
- 再発防止策の整理

### 引き継ぎページ

役割:
- 現在地の要約
- 次に着手すべき項目の提示
- 正本 handover への導線

### 設計 / 運用ページ

役割:
- PRD / SDD / README / handover への導線
- 現行実装と target state の読み分け整理
- 運用上の注意点の要約

## デザイン方針

- 共通ヘッダー、共通サイドナビ、共通フッターを持つ
- スキップリンクを設け、キーボード操作でも本文へ移動できるようにする
- 1 カラム主体で、情報が重いページではカード分割する
- 上部に「結論」を置く
- 重要度を色で補助しつつ、文言でも明示する
- アクセシビリティを考慮し、見出し階層と landmark を適切に使う
- `meta charset="UTF-8"` を明示する

## 技術方針

- 文字コードは UTF-8
- HTML は静的ファイル
- スタイルは共通 CSS に集約
- 将来のページ追加を見据えて URL 構造を固定する
- GitHub Pages 公開方針は `GITHUB_PAGES_PLAN.md` に従う

## ディレクトリ方針

```text
docs/site/
├── index.html
├── governance/
│   └── index.html
├── encoding/
│   └── index.html
├── handover/
│   └── index.html
├── architecture/
│   └── index.html
├── operations/
│   └── index.html
└── assets/
    └── css/
        └── site.css
```

## 実装順序

1. 本文書を追加する
2. `docs/site/` の最小ページを作る
3. 既存 Markdown 正本へのリンクを追加する
4. 既存文書からサイトへの導線を追加する
5. 将来ページを順次拡張する

## Phase 1 完了条件

- `docs/site/index.html` が存在する
- `docs/site/governance/index.html` が存在する
- `docs/site/encoding/index.html` が存在する
- `docs/site/handover/index.html` が存在する
- `docs/site/architecture/index.html` が存在する
- `docs/site/operations/index.html` が存在する
- 共通スタイルが存在する
- README と handover からサイトへ到達できる
- 全ページが共通ナビゲーションで接続されている

## 次フェーズ候補

- GitHub Pages 公開 workflow の検証
- パンくずとセクション内アンカーの追加
