# 🎨 figma-diff — Figma ↔ 実装 差分検証

Figma のデザインノードと実装（React/Tailwind）を突き合わせ、視覚要素の乖離とアノテーション由来のビジネスルール未反映を検出するスキル。

## 使い方

```
/figma-diff
```

「Figma と合ってる？」「Figma 準拠で実装できてるか確認」「Figma のデザインと実装を突き合わせて」「Figma から実装したやつをレビューして」でも起動。

## パイプライン

```
前提: Figma ノード（URL or nodeId + fileKey）と実装ファイルが特定できること
読込: Figma ノード（MCP）/ 実装ファイル / globals.css / layout.tsx
出力: 対応表（Figma → 実装）と乖離リスト
関連: /implement 直後 or /review の前に使うと効果的
```

## ⚠️ 最重要: `data--annotations`

Figma のアノテーション（`data--annotations`）にはビジネスルールが書かれていることがある。

例:
> 「回答データがない場合は削除可能。ただし、データがある場合は削除ができない。」

**視覚要素が一致していてもアノテーション未反映は 🔴 扱い。**

## プロセス

1. Figma URL または nodeId + fileKey を確認
2. `mcp__figma__get_design_context` で Figma ノードを取得
3. 実装ファイル・`globals.css`・`layout.tsx` を読込
4. CSS 変数トークン名のマッピング確認（`--radius/12` → `--radius-12` など）
5. 対応表を作成（視覚要素の一致・乖離を判定）
6. アノテーションのビジネスルールが実装に反映されているか確認
7. 結果を 🔴 / 🟡 / 🔵 で分類して出力

## ルール

- 検出した乖離は自動で修正しない
- 視覚差分の網羅よりビジネスルール抽出を優先
- 🔴 がある場合は Issue 化を提案
