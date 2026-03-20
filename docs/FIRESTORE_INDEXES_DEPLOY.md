# Firestore インデックスのデプロイ手順

## 前提
- Firestore を **Native mode** で作成済み
- `gcloud` と `firebase` CLI が利用できる環境

## 1. Firebase CLI の初期化（初回のみ）
```
firebase login
firebase use --add
```

## 2. インデックス定義の適用
```
firebase deploy --only firestore:indexes
```

## 3. インデックス定義ファイル
- リポジトリルートの `firestore.indexes.json`

## 注意
- インデックス作成は **課金対象**（作成・更新時に課金が発生する可能性あり）
- 作成完了まで数分〜数十分かかる場合があります
- 作成後は Firebase Console でステータス（Ready）を確認すること
