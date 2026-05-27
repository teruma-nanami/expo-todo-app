# 🖥️ feature-design — 機能設計

要件定義をもとに、機能一覧・画面フロー・状態遷移・サーバー境界・認証認可・画面APIマッピングを設計するスキル。

## 使い方

```
/feature-design
```

## パイプライン

```
前提: /requirements 完了
読込: docs/requirements/ / CLAUDE.md
出力: docs/features/{機能名}.md
次:   /db-design / /api-design
```

## プロセス（8ステップ）

1. 機能一覧（表形式）→ 承認
2. 画面フロー（Mermaid フローチャート）→ 承認
3. 状態遷移（Mermaid stateDiagram）→ 承認（該当リソースがある場合のみ）
4. ビジネスルール（条件・結果・違反時の挙動）→ 承認
5. サーバー境界図（Server / Client / URL の配置）→ 承認
6. 認証・認可設計（middleware / layout / page の3層）→ 承認
7. 画面・APIマッピング（操作・エンドポイント・取得タイミング）→ 承認
8. セルフレビュー（SEC / PERF / ARCH / UX の15項目を全自走）→ ❌ が残ったら修正、全 ✅ で出力

## ルール

- 各ステップで確認を取る
- セルフレビューに ❌ が残った状態では出力しない
- API のリクエスト/レスポンス詳細は `/api-design` のスコープ
