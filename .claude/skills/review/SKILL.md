---
name: review
description: >
  code-reviewer エージェントと Codex を並列起動し、CLAUDE.md 規約 + 設計書乖離 + 汎用品質 + Next.js / Web 固有観点でレビューする。
  「レビューして」「コードレビュー」「コードをチェックして」「変更内容を確認して」と言われた時に使用。
---

# コードレビュー

多角的にレビューする: プロジェクト規約 / 設計書乖離 / 汎用品質 / Next.js 固有セキュリティ / パフォーマンス。

## パイプライン

- 前提: 対象コードが存在すること
- 読込: ソースコード、`docs/features/`, `docs/api/`（整合性確認）
- 出力: レビュー結果
- 関連: `/refactor` と併用可

## Instructions

### Step 1: 対象ファイルの特定

ユーザーが対象を指定していない場合、develop ブランチとの差分で特定する:

```bash
git diff --name-only origin/develop...HEAD
```

develop ブランチが見つからない場合はユーザーに確認する。

### Step 2: 関連設計書の特定

差分ファイルから該当する機能を推定し、`docs/features/*.md` と `docs/api/*.md` を検索する。
対応する設計書が見つかった場合、後続のレビューで「設計書との乖離」を必須観点として指定する。

### Step 3: Codex の疎通確認

3b のレビュー実行担当を決めるため、最初に Codex の疎通を確認する:

```bash
codex --version
```

- 戻り値が正常（`codex-cli x.y.z` 等） → 3b は `codex:codex-rescue` で実行
- エラー（ENOENT 等）または `codex` が見つからない → 3b は `code-reviewer` で実行（同一プロンプト）

[FYI] 過去の事象: npm 経由でインストールされた `@openai/codex` のネイティブバイナリが消えるケースあり。`npm i -g @openai/codex` で復旧。

### Step 4: 2 つのレビューを並列実行

**Agent ツールで同時に（並列で）** 起動する。

#### 4a. Claude Code レビュー（プロジェクト固有 + 設計書乖離）

**code-reviewer** エージェント（subagent_type: `code-reviewer`）を起動する。

エージェントへのプロンプト:

```
以下のファイルを CLAUDE.md の規約と設計書に基づいてレビューしてください。

対象ファイル:
{ファイル一覧}

関連設計書:
{docs/features/*.md, docs/api/*.md のパス。なければ「該当なし」}

観点:

1. CLAUDE.md アーキテクチャ規約
   - バックエンド: Controller/Action/Repository/Service/Resource の責務境界
   - フロントエンド: Server/Client Component 境界、データ取得階層、hooks/ の判断基準
   - features/ 間の依存が型 import のみか
   - FormRequest の attributes() 日本語定義、use 文インポート等

2. 設計書との乖離（関連設計書がある場合のみ）
   - 設計書に書かれた機能・画面・API エンドポイントと実装が一致しているか
   - 設計書のサーバー境界図と実装の Server/Client 分離が一致しているか
   - 設計書のビジネスルールが実装に反映されているか
   - ❌ 設計書に書いてあるが実装にない / 実装にあるが設計書にない → 指摘
   - **重要度の判断軸**: 設計書は「実装指針」であって契約ではない。乖離を機械的に「重大」と分類せず、以下で判断する:
     - 🔴 重大: ビジネスルール・受入条件・API 仕様・セキュリティ要件の乖離（機能の挙動に関わる）
     - 🟡 注意: 引数の渡し方・順序・命名規約に外れる実装（保守性に関わる）
     - 🔵 提案: 命名差・コメント文言差・定数 vs リテラル差（読み手が等価と判定できるもの）
   - **修正方向の判断**: 乖離を指摘するときは「実装を直す」「設計書を直す」のどちらが筋が良いかも併記する:
     - TypeScript / Laravel の言語慣習・コーディング規約に沿っている方が正
     - grep 親和性・更新漏れリスクが低い方が正
     - 設計書改訂が筋なら「設計書改訂を推奨」と明示する

3. 認証・認可の実装
   - middleware / layout / page の 3 層のどこで弾いているか
   - Client Component の条件分岐をセキュリティ境界にしていないか
   - 「将来対応」で認可がスキップされていないか

結果は以下の形式で出力してください:

## サマリー
| 重要度 | 件数 |
|---|---|
| 🔴 重大 | N |
| 🟡 注意 | N |
| 🔵 提案 | N |

## 🔴 重大（必ず修正）
- **ファイル:行番号** — 問題の説明
  - カテゴリ: [規約違反 / 設計乖離 / 認可欠落]
  - 理由: なぜ問題か
  - 修正案: どう直すべきか
  - 設計乖離の場合: 実装を直すべきか、設計書を直すべきか、レビュアーとしての判断を明示

## 🟡 注意（修正推奨）
（同形式）

## 🔵 提案（検討事項）
（同形式）

## ✅ 良い点
（特筆すべき良い実装）
```

#### 4b. 汎用品質 + Next.js / Web レビュー

**エージェント選択（Step 3 の疎通確認結果に従う）:**

- Codex 疎通 OK: subagent_type `codex:codex-rescue`
- Codex 疎通 NG: subagent_type `code-reviewer`

**プロンプトは担当エージェントに依存させず、以下を統一して渡す。** フロント差分の有無で「Next.js / Web 観点」セクションを動的に含める/外す。

エージェントへのプロンプト:

```
以下の変更ファイルに対して、汎用的な品質レビューを行ってください。
プロジェクト固有の規約（CLAUDE.md・設計書乖離）は別レビュアーが担当中なので、ここでは下記の観点に集中してください。

対象ファイル:
{ファイル一覧}

## 基本観点（常に対象）

- セキュリティ（インジェクション、認証漏れ、機密情報の露出、SSRF、CSRF）
- エラーハンドリング（未処理例外、握りつぶし、Promise の取りこぼし）
- パフォーマンス（N+1、不要なループ、メモリリーク）
- ロジックの正確性（境界値、off-by-one、null/undefined 安全性）
- 可読性（命名、複雑度、重複コード、デッドコード）

{frontend/ 配下に差分がある場合のみ、以下のセクションを末尾に追加}

## Next.js / Web 観点（frontend 差分がある場合のみ）

1. Next.js 固有セキュリティ
   - NEXT_PUBLIC_* に機密情報が含まれていないか
   - Server Component で取得した機密情報を props で Client Component に漏らしていないか
   - Server Actions を使っている場合、認可チェックがあるか
   - middleware の認証チェックを迂回できる経路がないか（マッチャー設定漏れ）
   - dangerouslySetInnerHTML の使用（サニタイズされているか）
   - target="_blank" に rel="noopener noreferrer" があるか
   - API トークン・セッションが localStorage に保存されていないか

2. Server / Client 境界
   - "use client" が葉に留まっているか（コンテナが Client になっていないか）
   - useSearchParams を使う Client Component に親 <Suspense> があるか
   - データ取得が Server Component で完結し、Client で再フェッチしていないか
   - Client Component が hooks/ の判断基準を守っているか

3. Web Vitals / パフォーマンス
   - next/image を使っているか（<img> の直接使用は指摘）
   - next/font を使っているか
   - 重いコンポーネントが dynamic() で遅延ロードされているか
   - JS バンドルに不要なクライアントコードが含まれていないか
   - N+1 fetch（Server Component のループ内 fetch）

4. アクセシビリティ
   - aria-label, aria-current 等の適切な付与
   - セマンティックな HTML 構造（ul/li, nav, button vs span）
   - キーボード操作可能か

## 出力形式

重要度別（🔴 重大 / 🟡 注意 / 🔵 提案）に分類し、ファイル:行番号と修正案を明示してください。
```

[FYI] Codex は read-only でレビューだけ走らせれば十分なので、`--write` は不要。`codex:codex-rescue` の forwarder 側でデフォルトが write になっているため、プロンプト本文に「書き込み不要のレビュー専用作業（read-only でOK）」と明示しておく。

### Step 5: 結果の統合と出力

2 つのレビューが完了したら、結果を統合して以下の形式で出力する:

```markdown
# コードレビュー結果

## サマリー（統合）

| 重要度  | 件数 |
| ------- | ---- |
| 🔴 重大 | N    |
| 🟡 注意 | N    |
| 🔵 提案 | N    |

## 1. Claude Code レビュー（プロジェクト規約 + 設計書乖離）

{4a の詳細結果}

## 2. 汎用品質 + Next.js / Web レビュー（{担当エージェント名}）

{4b の詳細結果}

## 次のアクション

- 🔴 重大の指摘がある場合: 修正が必要です。修正しますか？
  - 設計乖離が含まれる場合は「実装を直す / 設計書を直す」の選択肢を明示してユーザーに確認する
- 🔴 重大がない場合: レビュー完了。`/commit` → `/pr` に進めます。
```

担当エージェント名は「Codex (codex:codex-rescue)」または「Claude Code (code-reviewer)」を明示する。Codex 不在で Claude にフォールバックした場合は、その旨も注記する。

### Step 6: 修正方針の確認（指摘がある場合）

ユーザーに修正方針を確認するときは以下の点を踏まえる:

- **PR が他者のものかどうか**: `git log` で PR ブランチの author を確認。ユーザー本人でない場合は、修正の進め方を確認する（コメントで返すだけ / 自分のローカルで設計書だけ直す / PR ブランチに直接 push）
- **スコープ外の根本問題**: レビューで「PR の責任範囲外だが直すべき問題（例: 既存の定数が API 仕様と矛盾）」を見つけた場合、本 PR で直すのではなく、別 Issue 起票を提案する
- **設計乖離の判断**: レビュアーとして「実装の方が良い」と判断した場合は、設計書改訂を提案する。Codex や code-reviewer の指摘を鵜呑みにせず、命名規約・grep 親和性・更新漏れリスクで再判断する
- **categories / tags 等のコピペ姉妹実装**: 一方を直すと他方と不整合になる指摘は、本 PR スコープに該当する方のみ修正し、もう一方は別 Issue で起票する

## ルール

- レビュー結果の修正は自動で行わない（ユーザーの判断に委ねる）
- 設計書が存在する場合、設計書乖離を必須観点として指定する
- 設計書乖離を機械的に重大に分類しない。命名・コメント文言・定数 vs リテラルなど「実装が等価以上に良い」乖離は提案レベルに留め、設計書改訂を推奨する
- 4b のプロンプトは担当エージェントに依存しない（Codex でも Claude でも同一）
- frontend/ 差分がない場合、4b プロンプトから Next.js / Web 観点セクションを外す
- 他者の PR をレビューする場合、修正コミットを push する前に必ずユーザーに対応範囲を確認する
- スコープ外の根本問題は別 Issue 起票で提案する
- `/refactor` と組み合わせて改善を提案できる

## Troubleshooting

Error: develop ブランチとの差分が取れない
Cause: develop ブランチが存在しない、または fetch されていない
Solution: `git fetch origin` を実行し、ブランチ名をユーザーに確認する

Error: 設計書が見つからない
Cause: `/feature-design` を通さずに実装された
Solution: 設計書乖離観点はスキップし、規約・汎用品質のみでレビューする。ユーザーに設計書不在を通知する

Error: 差分が大きく code-reviewer のプロンプトが長大になる
Cause: 4a と 4b の並列起動でそれぞれに多量のコードを渡している
Solution: 差分を論理単位（フロント / バックエンド / docs）で分割し、4a と 4b を順次実行する。または差分ファイル数が 30 を超える場合は最初から順次実行に切り替える

Error: Codex が起動できない（ENOENT 等）
Cause: `@openai/codex` のネイティブバイナリが消えている、または codex が未インストール
Solution: `npm i -g @openai/codex` で復旧。復旧不能な場合は 4b を `code-reviewer` で実行（プロンプトは同一）

Error: 4b の Codex エージェントが結果未出力で終了する
Cause: Codex CLI が途中で落ちた、または companion runtime のジョブが失敗
Solution: `node ${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs status` でジョブ状態を確認。failed が続く場合は `code-reviewer` にフォールバックして再実行する
