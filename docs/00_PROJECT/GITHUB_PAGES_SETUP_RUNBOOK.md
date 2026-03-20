# GitHub Pages 設定手順書

最終更新日: 2026-03-20  
位置付け: 実行手順書  
関連文書:
- [GITHUB_PAGES_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/GITHUB_PAGES_PLAN.md)
- [DOCUMENT_SITE_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/DOCUMENT_SITE_PLAN.md)
- [HANDOVER.md](C:/VSCode/CloudePL/kaigoIDE/docs/HANDOVER.md)

## 目的

この手順書は、`docs/site/` を GitHub Pages で公開するために必要な GitHub 側設定、Playwright による確認結果、残課題を定義する。

## 結論

2026-03-20 時点で GitHub Pages の公開は完了している。  
公開 URL は以下:

- `https://knoguchi-ship-it.github.io/kaigo-ide/`

現在の到達状態:
- repository visibility は `public`
- `Settings > Pages` の `Source` は `GitHub Actions`
- `Pages` workflow は成功
- Playwright で公開ホーム `KaigoIDE Docs` の表示を確認済み

未解決:
- 公開サイトで `favicon.ico` の 404 が 1 件出る
- `actions/checkout@v4` などに Node.js 20 廃止警告が出る

## Playwright 証跡

### 1. 初回の公開 URL は 404

Playwright で `https://knoguchi-ship-it.github.io/kaigo-ide/` を確認した結果、`Site not found · GitHub Pages` が表示された。

![GitHub Pages public 404](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-public-404.png)

判断:
- GitHub Pages はまだ有効化されていなかった
- もしくは repository 側の公開条件を満たしていなかった

### 2. 設定画面では public 化または upgrade が必要だった

`Settings > Pages` では `Upgrade or make this repository public to enable Pages` と表示された。

![GitHub Pages upgrade or public](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-upgrade-or-public.png)

判断:
- 個人運用かつ無料寄りの方針では `public` 化が現実解
- private repository のままでは Pages を有効化できなかった

### 3. repository を public 化した

`Settings > General > Danger Zone` から visibility を `public` に変更した。

![GitHub general danger zone before](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-general-danger-zone-before.png)
![GitHub change visibility dialog](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-change-visibility-dialog.png)
![GitHub general after public](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-general-after-public.png)

### 4. Pages の Source を GitHub Actions に切り替えた

public 化後、`Settings > Pages` で `Source` を `Deploy from a branch` から `GitHub Actions` に変更した。

![GitHub Pages settings before enable](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-settings-before-enable.png)
![GitHub Pages settings after GitHub Actions](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-settings-after-github-actions.png)

### 5. 失敗済み Pages workflow を再実行して成功させた

切替前に失敗していた `Pages` workflow は、`Source = GitHub Actions` に変更した後に再実行し、`build` と `deploy` の両方が成功した。

![GitHub Pages actions success](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-actions-success.png)

原因:
- 失敗時点では `actions/configure-pages` が Pages site を取得できなかった
- source 切替後の再実行で解消した

### 6. 公開 URL の表示を確認した

Playwright で公開 URL を開き、タイトル `KaigoIDE Docs` とホーム画面の表示を確認した。

![GitHub Pages live home](C:/VSCode/CloudePL/kaigoIDE/docs/site/assets/img/github-pages-live-home.png)

補足:
- ブラウザ console には `favicon.ico` の 404 が 1 件出ている
- 本文・ナビゲーション・各ページリンクは表示できている

## 実施手順

### Step 1. repository を public にする

1. `Settings > General` を開く
2. `Danger Zone` の visibility 変更を開く
3. `Change to public` を選ぶ
4. 確認ダイアログを完了して public にする

期待結果:
- `This repository is currently public.` が表示される

### Step 2. `Settings > Pages` を開く

1. `Settings` を開く
2. 左ナビの `Pages` を開く

URL:
- `https://github.com/knoguchi-ship-it/kaigo-ide/settings/pages`

期待結果:
- `Build and deployment` セクションが表示される

### Step 3. `Source` を `GitHub Actions` にする

1. `Source` を開く
2. `GitHub Actions` を選択する

期待結果:
- `GitHub Pages source saved.` が表示される
- workflow テンプレート候補が表示される

### Step 4. `Pages` workflow を成功させる

1. `Actions` タブを開く
2. `Pages` workflow を開く
3. 既存の失敗 run がある場合は `Re-run failed jobs` を実行する
4. `build` と `deploy` が success になることを確認する

workflow ファイル:
- [pages.yml](C:/VSCode/CloudePL/kaigoIDE/.github/workflows/pages.yml)

期待結果:
- `Status: Success`
- `build` success
- `deploy` success

### Step 5. 公開 URL を確認する

1. `https://knoguchi-ship-it.github.io/kaigo-ide/` を開く
2. `KaigoIDE Docs` のホームが表示されることを確認する
3. `governance` / `encoding` / `handover` / `architecture` / `operations` に遷移できることを確認する

期待結果:
- `Site not found` が出ない
- `docs/site/index.html` 相当のホームが表示される

## 現在の残課題

### 残課題 1. `favicon.ico` の 404

現象:
- 公開ホーム表示時に `favicon.ico` の取得で 404 が 1 件出る

影響:
- 本文表示には影響しない
- console がきれいではない

次対応:
- `docs/site/favicon.svg` を追加する
- 各 HTML の `<head>` に `rel="icon"` を入れる
- 相対パスで Pages 配下から確実に解決できるようにする

### 残課題 2. GitHub Actions の Node.js 20 廃止警告

現象:
- `actions/checkout@v4`
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

上記 action に対して Node.js 20 廃止警告が出ている。

次対応:
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` を `pages.yml` に設定する
- `actions/checkout` は Node 24 対応の `v5` 系へ上げる
- `configure-pages` / `upload-pages-artifact` / `deploy-pages` は公式 tag のフル SHA pin に寄せる

## 確認チェックリスト

- repository は public
- `Settings > Pages` の `Source` は `GitHub Actions`
- `Actions > Pages` が success
- 公開 URL で `KaigoIDE Docs` が表示される
- 公開サイトの主要ページに遷移できる

## 参照

- GitHub Docs: Using custom workflows with GitHub Pages  
  https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Docs: Configuring a publishing source for your GitHub Pages site  
  https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Docs: Creating a custom 404 page for your GitHub Pages site  
  https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site
- GitHub Blog: Deprecation of Node 20 on GitHub Actions runners  
  https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
