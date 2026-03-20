# 文字コード方針

最終更新日: 2026-03-20  
位置付け: 正本  
関連ルール: [PROJECT_GROUND_RULES.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/PROJECT_GROUND_RULES.md)

## 目的

この文書は、本リポジトリにおける文字コードの標準、既知の問題、原因、再発防止方針を定義する。

## 結論

本リポジトリのテキスト系ファイルは、原則として **UTF-8** を標準とする。

対象には少なくとも以下を含む。
- Markdown
- TypeScript
- TSX
- JavaScript
- JSON
- YAML
- HTML
- CSS
- 設定ファイル

## 現在確認できている事象

### 1. 表示時の文字化け

UTF-8 で保存された正常なファイルでも、Windows PowerShell 5.1 などの表示環境によっては文字化けして見えることがある。

2026-03-20 時点の確認内容:
- Windows PowerShell: 5.1
- Active code page: 932
- UTF-8 ファイルを CP932 として解釈すると `縺` 系の文字化けが発生する

### 2. 実ファイル内の文字化け

一部のソースコードでは、例外メッセージ文字列そのものが文字化けした状態で保存されている。

2026-03-20 時点の確認対象:
- `services/api/src/monitoring-record/monitoring-record.service.ts`
- `services/api/src/care-plan/care-plan.service.ts`
- `services/api/src/client/client.service.ts`
- `services/api/src/care-record/care-record.service.ts`

これは表示問題ではなく、実データ破損として扱う。

## 原因分析

### 確認できた原因

1. UTF-8 で保存されたファイルを、CP932 前提の表示経路で読むと文字化けする
2. Windows PowerShell 5.1 は文字コード取り扱いで混乱を生みやすい
3. リポジトリに `.editorconfig` と `.gitattributes` が存在せず、文字コード方針が機械的に固定されていない

### 推定原因

以下は推定である。

- 文字化けした表示結果を、そのまま編集結果として保存した可能性が高い
- 実ファイル破損は広範囲ではなく、比較的新しいローカル変更で混入した可能性が高い

## 標準方針

### ファイル保存

- テキスト系ファイルは UTF-8 で保存しなければならない
- 文字コードを自動推測に任せすぎてはならない
- 既知の日本語文書および日本語メッセージを含むコードでは、保存時のエンコーディング確認を行う

### 表示・編集環境

- 可能であれば PowerShell 7 系を優先する
- Windows PowerShell 5.1 を使う場合は、表示結果だけでファイル破損を判断してはならない
- 文字化けを確認した場合は、まず UTF-8 としての実体確認を行う

### リポジトリ運用

- `.editorconfig` を追加済みとし、UTF-8 を標準として固定する
- `.gitattributes` を追加済みとし、主要テキスト拡張子の取り扱いを明示する
- `working-tree-encoding` は、現時点ではクライアント互換性リスクを避けるため採用しない
- 文字化け修復は、表示問題と実ファイル破損を分けて扱う

## 修復方針

### Phase 1: 文書と方針の固定

- 本文書を正本化
- 既存ドキュメントから参照

### Phase 2: リポジトリ設定の固定

- `.editorconfig` を維持管理する
- `.gitattributes` を維持管理する
- 行末は原則 LF とし、Windows 専用スクリプトだけを例外扱いする

### Phase 3: 実ファイル破損の修復

- 例外メッセージなど、破損が確認できた文字列を正しい日本語へ戻す
- 修復対象は差分と履歴を確認しながら個別に扱う

## 既知の未対応事項

- 文字化けした例外メッセージの実コード修復は未着手
- Windows 端末での標準シェル運用方針は未固定
- 既存ファイル全体の文字コード / 行末再正規化は未確認

## 参照

- Microsoft Learn: about_Character_Encoding  
  https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_character_encoding
- W3C Internationalization Best Practices  
  https://www.w3.org/TR/international-specs/
- Git documentation: gitattributes  
  https://git-scm.com/docs/gitattributes
