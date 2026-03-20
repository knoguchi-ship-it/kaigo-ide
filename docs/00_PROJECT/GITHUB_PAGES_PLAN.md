# GitHub Pages 公開計画

最終更新日: 2026-03-20  
位置付け: 正本  
関連ルール:
- [PROJECT_GROUND_RULES.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/PROJECT_GROUND_RULES.md)
- [DOCUMENT_SITE_PLAN.md](C:/VSCode/CloudePL/kaigoIDE/docs/00_PROJECT/DOCUMENT_SITE_PLAN.md)

## 目的

この文書は、`docs/site/` 配下の静的ドキュメントサイトを GitHub Pages で安定公開するための方針を定義する。

## 結論

GitHub Pages の公開方式は、`GitHub Actions` によるカスタム workflow を正とする。

公開対象は `docs/site/` 配下の静的 HTML 一式とし、公開物はそれ単体で完結しなければならない。

## 根拠

2026-03-20 時点の GitHub 公式情報では、GitHub Pages のデプロイと自動化には GitHub Actions を使う方式が推奨されている。

また、Jekyll をバイパスした静的配信が必要な場合は `.nojekyll` を配置する方式が認められている。

## 採用方針

### 1. 公開方式

- GitHub Pages は GitHub Actions workflow で公開する
- branch source への直接依存は避ける
- workflow は `master` と `main` の両方に対応させる

### 2. 公開対象

- 公開 artifact は `docs/site/` のみとする
- 公開物のルートに `.nojekyll` を含める
- `404.html` を置き、存在しないパスでもサイトへ戻れるようにする

### 3. リンク方針

- サイト内ページ同士は相対リンクで接続する
- 公開対象外の Markdown や設定ファイルへは、GitHub repository の `blob` URL でリンクする
- GitHub Pages 上で repo ルート外を相対パスで参照してはならない

### 4. 正本の扱い

- 正本は従来どおり Markdown に置く
- HTML は視覚導線として扱う
- HTML から正本を参照する場合は、GitHub 上の閲覧 URL を使う

## 実装方針

1. GitHub Pages workflow を追加する
2. `docs/site/.nojekyll` を追加する
3. `docs/site/404.html` を追加する
4. HTML 内の正本リンクを GitHub Pages 安全な URL に置き換える
5. README / handover から公開方針へ到達できるようにする

## 運用上の注意

- Pages の公開設定で source は `GitHub Actions` を選ぶ
- repository の default branch が `master` から変わる場合は、GitHub blob URL の参照先も更新する
- 将来的に Markdown を HTML 化する場合は、別 build step か静的サイトジェネレータの導入を再検討する

## 完了条件

- GitHub Actions による Pages workflow が存在する
- `docs/site/` が公開 artifact として完結している
- `.nojekyll` が存在する
- `404.html` が存在する
- 公開対象外への相対リンクが残っていない

## 参照

- GitHub Docs: Using custom workflows with GitHub Pages  
  https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Docs: Configuring a publishing source for your GitHub Pages site  
  https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Docs: About GitHub Pages and Jekyll  
  https://docs.github.com/github/working-with-github-pages/about-github-pages-and-jekyll
- GitHub Docs: Creating a custom 404 page for your GitHub Pages site  
  https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site
