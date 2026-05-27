---
name: figma-diff
description: >
  Figma ノードと現在の実装（React/Tailwind）を付き合わせ、視覚要素の乖離と
  アノテーション（data--annotations）に埋め込まれたビジネスルールを列挙する。
  「Figma と合ってる？」「Figma 準拠で実装できてるか確認」「Figma のデザインと実装を突き合わせて」
  「Figma から実装したやつをレビューして」と言われた時に使用。
---

# Figma ↔ 実装 差分検証

Figma のデザインノードと実装を突き合わせ、**視覚要素の乖離** と
**アノテーション由来のビジネスルール** を可視化する。

## なぜ必要か

Figma MCP の `get_design_context` は視覚要素（サイズ/色/余白/typography）の
React+Tailwind 参照コードを返す。それを見ながら実装すると視覚要素は合いやすいが、
以下を見落としやすい:

- **`data--annotations` に書かれたビジネスルール**（例: 「回答がある場合は削除不可」）
- **プロジェクト側のグローバル設定との整合**（font-family, CSS 変数マッピング）
- **CSS 変数トークン名の対応ミス**（Figma の `--radius/12` → 実装の `--radius-12`）

このスキルは `/implement` の直後、または `/review` の前に差し込むことで
「視覚一致だがルール欠落」を防ぐ。

## パイプライン

- 前提: Figma ノード（URL or nodeId + fileKey）と対象実装ファイルが特定できること
- 読込: Figma ノード（MCP）、実装ファイル、`frontend/src/app/globals.css`, `layout.tsx`
- 出力: 対応表（Figma → 実装）と「❌ 乖離」リスト。重要度別に分類
- 関連: `/implement` 直後、`/review` の前に使うと効果的

## Instructions

### Step 1: 対象の特定

ユーザーから以下を受け取る（どれか欠けていればユーザーに確認する）:

- Figma URL もしくは nodeId + fileKey
- 対応する実装ファイルパス（1 つでも良いが、複数関連ファイルが望ましい）

Figma URL からの抽出例:

```
https://www.figma.com/design/mCB77wrB34rKb3bzqvRWUG/...?node-id=2986-31260
→ fileKey = "mCB77wrB34rKb3bzqvRWUG"
→ nodeId = "2986-31260"
```

### Step 2: Figma ノードの取得

`mcp__figma__get_design_context` を呼ぶ。引数:

```
nodeId: <Step 1 で取得>
fileKey: <Step 1 で取得>
clientFrameworks: "react,next"
clientLanguages: "typescript,tailwindcss"
```

レスポンスから以下を抽出:

1. 参照コード（React+Tailwind）
2. 各要素の `data-node-id`, `data-name`, **`data--annotations`**（★最重要）
3. デザインシステム情報（typography / box-shadow / 色トークン）
4. スクリーンショット

### Step 3: 実装ファイルの読込

対象実装ファイル（典型的には `frontend/src/features/**/components/*.tsx`
または `frontend/src/components/elements/*.tsx`）を Read する。

親コンポーネント（実装を呼び出している側）も読む。
ビジネスルール判定は親コンポーネントに落ちていることが多い。

### Step 4: グローバル設定との整合確認

以下を確認する:

- `frontend/src/app/globals.css` — CSS 変数の定義（`--color-*`, `--radius-*`,
  `--shadow-*`, `--spacing-*`, typography 系）
- `frontend/src/app/layout.tsx` — フォント設定（Noto Sans JP 等）
- プロジェクトで採用している UI ライブラリ（HeroUI v3 等）の使用方針

Figma 側のトークン名（`--radius/12`, `box-shadow/float`）が
実装側のトークン名（`--radius-12`, `--shadow-float`）に正しく
マッピングされているかを照合する。

### Step 5: 対応表の作成

以下の形式で出力する。判定は ✅ / ⚠ / ❌。

```markdown
| 項目       | Figma                   | 実装                                  | 判定 |
| ---------- | ----------------------- | ------------------------------------- | ---- |
| 角丸       | `radius/12` (12px)      | `rounded-[var(--radius-12)]`          | ✅   |
| 影         | `box-shadow/float`      | `shadow-[var(--shadow-float)]`        | ✅   |
| 背景       | `base/white`            | `bg-[var(--color-bg-white)]`          | ✅   |
| padding    | `pt-8 pb-12 px-16`      | `pt-2 pb-3 px-4` (= 8/12/16px)        | ✅   |
| 最小幅     | `min-w-[160px]`         | `min-w-[160px]`                       | ✅   |
| font       | Noto Sans JP Medium 14  | `text-sm font-medium` + `--font-sans` | ✅   |
| text color | `#2a2b2b` (`base/high`) | `text-[var(--color-text-base-high)]`  | ✅   |
```

対応表は「すべての要素 × すべての属性」を網羅せず、**差分が出た箇所と、
差分が出そうな箇所（CSS 変数マッピング等）を優先**して書く。

### Step 6: アノテーションの取り扱い（★最重要）

`data--annotations` は `get_design_context` のレスポンス内に
文字列として埋め込まれている。日本語の自然文で書かれていることが多い。

典型例:

```
data--annotations="PJ削除の仕様



回答データがない場合は削除可能。ただし、データがある場合は削除ができない。"
```

これは「このコンポーネントは特定条件で無効化する必要がある」という
**ビジネスルール** であり、視覚要素と別の扱いが必要。

チェック:

- 実装側でそのルールが反映されているか（disabled 制御 / 条件分岐 / 認可チェック）
- 反映されていなければ「❌ ビジネスルール未反映」として最上位に報告する

### Step 7: 結果の出力

以下のフォーマットで出力する:

```markdown
# Figma ↔ 実装 差分検証結果

## 対象

- Figma: node <nodeId> (<fileKey>)
- 実装: <ファイルパス>

## 視覚要素 対応表

<Step 5 の表>

## ❌ 乖離 / 未反映

### 🔴 ビジネスルール未反映

- **<項目>** — <Figma アノテーションの抜粋>
  - 現在の実装: <該当箇所>
  - 影響: <ユーザー操作で起きる問題>
  - 修正案: <どこに何を足すか>

### 🟡 視覚要素の差分

- **<項目>** — Figma: X / 実装: Y
  - 原因候補: <トークン名ミス / 値の手打ちミス 等>
  - 修正案: <具体的な className 変更>

### 🔵 注意点（任意）

- <グローバル設定との整合で気をつけること>

## ✅ 一致している点

<特筆すべき正しい実装>

## 次のアクション

- 🔴 がある場合: Issue を立てて `/implement` に進む
- 🔴 がない場合: 視覚一致・ルール反映済み。マージに進んで OK
```

## ルール

- **アノテーション（`data--annotations`）は必ず拾う**。視覚要素より重要
- **検出した乖離は自動で修正しない**。Issue 化判断はユーザーに委ねる
- 大量のノード差分がある場合（画面丸ごと等）は、視覚差分の網羅より
  ビジネスルール抽出を優先
- `/implement` と組み合わせて検出 → 修正フローを回せる
- 視覚要素の差分が 0 でもアノテーション未反映は 🔴 扱い

## Troubleshooting

Error: nodeId が不正
Cause: Figma のノード ID は `<int>-<int>` か `<int>:<int>` の形式が必要
Solution: URL から取り出した `node-id=2986-31260` の `-` を `:` に変換せず
そのまま nodeId パラメータに渡す。MCP 側で正規化される

Error: Figma MCP がノードを返さない / 空
Cause: ノードが Figma 上で削除された、または MCP の権限不足
Solution: ユーザーに最新の nodeId を確認。画面ノード ID と要素ノード ID を
取り違えている場合は `mcp__figma__get_metadata` で構造を確認する

Error: 視覚要素は一致しているのにアノテーションに違反している実装が既にマージ済み
Cause: 過去の PR が視覚要素だけに目を向けて実装されている
Solution: 新規 Issue を立て直して対応。この時、コミットメッセージで
「Figma アノテーション反映」の文言を入れ、同じ失敗の履歴が追えるようにする
