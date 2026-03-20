# GitHub Pages 設定手順書

最終更新日: 2026-03-20  
位置付け: 実行手順書  
関連文書:
- [GITHUB_PAGES_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_PLAN.md)
- [DOCUMENT_SITE_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/DOCUMENT_SITE_PLAN.md)
- [HANDOVER.md](C:/VSCode/CloudePL/kaigoIDE/docs/HANDOVER.md)

## 目的

この手順書は、`docs/site/` を GitHub Pages で公開するために必要な GitHub 側設定と確認手順を定義する。

## 結論

2026-03-20 時点で、リポジトリ側の実装は完了している。

完了済み:
- `master` ブランチへ Pages workflow を push 済み
- `docs/site/` は Pages 用の静的公開物として整備済み
- `.nojekyll` と `404.html` を追加済み

未完了:
- GitHub repository の `Settings > Pages` で `Source = GitHub Actions` を有効化
- `Actions` の `Pages` workflow 実行確認
- 公開 URL の最終確認

## Playwright 確認結果

### 1. 公開 URL

Playwright で `https://knoguchi-ship-it.github.io/kaigo-ide/` を確認した結果、`Site not found · GitHub Pages` が表示された。

![GitHub Pages public 404](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-public-404.png)

判断:
- GitHub Pages はまだ配信開始していない
- もしくは Pages 自体が未有効化

### 2. Settings > Pages

Playwright で `https://github.com/knoguchi-ship-it/kaigo-ide/settings/pages` を確認した結果、未ログインまたは非公開アクセス不可のため `404` になった。

![GitHub settings pages 404](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-site-not-found.png)

判断:
- GitHub 側設定の実操作には、対象 repository へアクセスできる認証済みセッションが必要

## 前提条件

1. GitHub 上で対象 repository にアクセスできること
2. repository の管理権限または Pages 設定権限を持っていること
3. `master` ブランチに最新コミットが反映済みであること

## 実施手順

### Step 1. GitHub にログインする

1. GitHub にブラウザでログインする
2. `https://github.com/knoguchi-ship-it/kaigo-ide` が開けることを確認する

期待結果:
- repository のトップページが見える

### Step 2. Pages 設定を開く

1. `Settings` を開く
2. 左ナビの `Pages` を開く

直接 URL:
- `https://github.com/knoguchi-ship-it/kaigo-ide/settings/pages`

期待結果:
- `Build and deployment` セクションが表示される

### Step 3. Source を GitHub Actions にする

1. `Source` を確認する
2. `GitHub Actions` を選択する
3. 保存する

期待結果:
- Pages が Actions workflow を公開元として認識する

### Step 4. Actions を確認する

1. `Actions` タブを開く
2. `Pages` workflow が起動していることを確認する
3. `build` と `deploy` が成功していることを確認する

workflow ファイル:
- [pages.yml](C:/VSCode/CloudePL/kaigoIDE/.github/workflows/pages.yml)

期待結果:
- `Deploy to GitHub Pages` が success になる

### Step 5. 公開 URL を確認する

1. `https://knoguchi-ship-it.github.io/kaigo-ide/` を開く
2. `KaigoIDE Docs` のホームが表示されることを確認する
3. `governance` / `encoding` / `handover` / `architecture` / `operations` に遷移できることを確認する

期待結果:
- `Site not found` が消える
- `docs/site/index.html` 相当のホームが表示される

## トラブルシュート

### 症状 1. 公開 URL が 404 のまま

確認項目:
1. `Settings > Pages` で `Source = GitHub Actions` になっているか
2. `Actions > Pages` workflow が成功しているか
3. repository が正しい owner / repo 名で公開 URL に対応しているか

### 症状 2. repository 自体が 404

確認項目:
1. GitHub にログインしているか
2. repository が private の場合、対象アカウントにアクセス権があるか
3. owner 名と repo 名が正しいか

### 症状 3. workflow が見えない

確認項目:
1. `master` に `pages.yml` が push 済みか
2. `Actions` が repository で無効化されていないか

## 参照

- GitHub Docs: Using custom workflows with GitHub Pages  
  https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Docs: Configuring a publishing source for your GitHub Pages site  
  https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Docs: Creating a custom 404 page for your GitHub Pages site  
  https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site
