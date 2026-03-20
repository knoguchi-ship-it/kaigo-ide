# 差分メモ

正本は [HANDOVER.md](C:/VSCode/CloudePL/kaigoIDE/docs/HANDOVER.md) です。

最上位ルールは [PROJECT_GROUND_RULES.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/PROJECT_GROUND_RULES.md) です。
文字コード方針の正本は [ENCODING_POLICY.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/ENCODING_POLICY.md) です。
ドキュメントサイト計画の正本は [DOCUMENT_SITE_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/DOCUMENT_SITE_PLAN.md) です。
GitHub Pages 公開計画の正本は [GITHUB_PAGES_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_PLAN.md) です。
最新セッションの引き継ぎメモは [SESSION_HANDOVER_2026-03-20.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/SESSION_HANDOVER_2026-03-20.md) です。

## 2026-03-20 時点

- 現行 API は Firestore ベース
- GCP 主軸
- AI は `AI_PROVIDER` で切替
  - 開発: `gemini`
  - 本番想定: `vertex`
- `services/api/.env.production.example` を追加済み
- production では `DEV_LOGIN_ENABLED=false`
- 起動時に環境変数バリデーションを実施
- 表示系の文字化けと実ファイル破損を区別する方針を追加
- `.editorconfig` と `.gitattributes` を追加
- `docs/site/` に接続済みの HTML サイト骨格を追加
- repository を `public` 化し、GitHub Pages は `GitHub Actions` 公開で有効化済み
- Playwright で公開 URL `https://knoguchi-ship-it.github.io/kaigo-ide/` の表示を確認済み
- `favicon` 追加と `pages.yml` の Node 24 / SHA pin 対応は完了
- worktree は dirty のまま。未整理変更を勝手に戻さないこと
- `pnpm build` は成功
- `pnpm test` はテスト未整備のため失敗
