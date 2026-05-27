# 📋 requirements — 要件定義

対話形式で要件をヒアリングし、仕様ドキュメントを作成するスキル。

## 使い方

```
/requirements
```

## パイプライン

```
前提: なし
出力: docs/requirements/（新機能）
      docs/maintenance/{ID}-{kebab-case}.md（保守運用）
次:   /feature-design → /db-design → /api-design
```

## プロセス

1. ヒアリング（目的・アクター・ユースケース・非機能要件を2〜3問ずつ）
2. ユーザーストーリー・機能要件・非機能要件・画面/API一覧を整理して承認
3. 承認後 Markdown でドキュメントを出力

## ルール

- 承認なしにファイル出力しない
- 開発着手に必要十分な粒度（過度に詳細にしない）
- 不明点を残さない
