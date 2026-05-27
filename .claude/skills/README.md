# 🛠️ .claude/skills/ 構成・運用ガイド

## 📌 概要

このディレクトリは、Claude Code（CC）がプロジェクトの開発ライフサイクル全体を通じて呼び出せる**カスタムスキル（スラッシュコマンド）**を格納しています。

各スキルはサブディレクトリ内の `SKILL.md` で定義され、開発の各フェーズ（計画・設計・実装・品質管理）に対応したショートカットとして機能します。

---

## 📂 スキル一覧

| スキル名 | 呼び出し方 | 役割 |
| --- | --- | --- |
| **requirements** | `/requirements` | 対話形式で要件を定義し、仕様ドキュメントを作成する |
| **feature-design** | `/feature-design` | 機能一覧・画面フロー・状態遷移・サーバー境界・画面APIマッピングを設計する |
| **db-design** | `/db-design` | 要件・機能設計をもとにER図とテーブル定義を設計する |
| **api-design** | `/api-design` | 要件・DB設計をもとにRESTful APIの仕様を設計する |
| **branch** | `/branch` | Git Flow に沿ってブランチを作成する |
| **implement** | `/implement` | 仕様ドキュメントをもとに CLAUDE.md アーキテクチャに沿って実装する |
| **test-gen** | `/test-gen` | 実装されたコードに対してテストを生成する |
| **review** | `/review` | code-reviewer と Codex を並列起動し多角的なコードレビューを行う |
| **refactor** | `/refactor` | 対象コードを分析し、アーキテクチャに沿ったリファクタリングを提案する |
| **figma-diff** | `/figma-diff` | Figmaデザインと実装の視覚乖離・ビジネスルール未反映を検証する |
| **commit** | `/commit` | format / lint / typecheck を自動実行してからコミットを作成する |
| **pr** | `/pr` | Pull Request を作成し、CI監視と自己修復を行う |
| **issue** | `/issue` | 要件定義をもとにGitHub Issueを作成する |

---

## 🔍 各スキル詳細

### 📋 requirements — 要件定義

**パイプライン:** なし → `docs/requirements/`（or `docs/maintenance/`）→ 次は `/feature-design`

対話形式でヒアリングしながら要件を整理し、ドキュメントを作成する。
- **新機能**: `docs/requirements/` に出力
- **保守運用**: `docs/maintenance/{ID}-{内容のkebab-case}.md` に出力

承認なしにファイル出力しない。

---

### 🖥️ feature-design — 機能設計

**パイプライン:** `/requirements` → `docs/features/` → 次は `/db-design`, `/api-design`

機能一覧・画面フロー・状態遷移・ビジネスルール・サーバー境界図・認証認可設計・画面APIマッピングを段階的に設計する。

各ステップで確認を取りながら進め、最後にセルフレビュー（SEC / PERF / ARCH / UX の15項目）を実施。❌ が残った状態では出力しない。

---

### 🗄️ db-design — DB設計

**パイプライン:** `/requirements` → `docs/database/` → 次は `/api-design`

要件・機能設計をもとに ER 図（Mermaid）とテーブル定義を設計する。

**DB規約（CLAUDE.md 準拠）:**
- テーブル名: 複数形 `snake_case`、カラム名: `snake_case`
- 必須カラム: `id`, `created_at`, `updated_at`、論理削除: `deleted_at`
- 設計は第3正規形を基本。段階的に確認を取り、承認後に `docs/database/` へ出力

---

### 📐 api-design — API仕様設計

**パイプライン:** `/requirements` + `/db-design` → `docs/api/` → 次は `/implement`

CLAUDE.md の規約に準拠した RESTful API 仕様を段階的に設計する。

**レスポンス規約:**

| コード | 用途 |
| --- | --- |
| 200 | 成功 |
| 201 | 作成成功 |
| 401 | 未認証 |
| 403 | 権限なし |
| 404 | リソース未検出 |
| 422 | バリデーション / ビジネスロジックエラー |
| 500 | サーバーエラー |

---

### 🌿 branch — ブランチ作成

Git Flow に沿って正しいベースブランチから新ブランチを作成する。

- `feature/{タスク名}` → `develop` から作成
- `hotfix/{内容}` → `main` から作成
- `release/{x.x.x}` → `develop` から作成

ブランチ名を提案 → ユーザー承認 → 作成。承認なしに切らない。

---

### ⚙️ implement — 実装

**パイプライン:** `/requirements`（+ 各設計書）→ ソースコード → 次は `/test-gen`

CLAUDE.md の実装順序に従って実装する。

**バックエンド実装順:**
1. マイグレーション + Model
2. Repository（インターフェース + 実装 + DI バインド）
3. FormRequest
4. Action（ビジネスロジック）
5. Service（必要な場合のみ）
6. Resource
7. Controller + ルーティング

**フロントエンド実装順:**
1. `types/` → 2. `api/` → 3. `hooks/` → 4. `components/`（すべて `features/{機能名}/` 内）

実装完了後は自動で `/review` を実行する。

---

### 🧪 test-gen — テスト生成

**パイプライン:** `/implement` → テストコード → 次は `/review`（任意）

PHPUnit ベースで実装コードのテストを生成する。

- `tests/Unit/`: Action, Service の単体テスト
- `tests/Feature/`: API エンドポイントの結合テスト

**ルール:** AAA パターン（Arrange / Act / Assert）、メソッド名は日本語、正常系・異常系・境界値を網羅、`RefreshDatabase` で毎回 DB 初期化。

---

### 🔍 review — コードレビュー

**パイプライン:** 対象コードが存在 → レビュー結果 → 関連: `/refactor`

`code-reviewer` エージェントと Codex を**並列**で起動し、多角的にレビューする。

| エージェント | 観点 |
| --- | --- |
| **code-reviewer** | CLAUDE.md 規約、設計書乖離、認証・認可 |
| **Codex**（疎通 NG 時は code-reviewer）| セキュリティ、エラーハンドリング、パフォーマンス、Next.js 固有 |

結果は統合して重要度別（🔴重大 / 🟡注意 / 🔵提案）に出力。設計乖離は機械的に重大扱いせず、「実装を直す / 設計書を直す」の判断を明示。

---

### 🔧 refactor — リファクタリング提案

**パイプライン:** 対象コードが存在 → 提案（実施はユーザー承認後）→ 関連: `/review`

コードの臭い・アーキテクチャ違反・パフォーマンス問題を分析し、改善提案を行う。

**分析観点:** 長すぎるメソッド、重複コード、深いネスト、責務違反（Controller/Action/Repository/Service の境界）、N+1、features 間の不正依存など。

動作を変えないリファクタリングに限定。段階的に改善できるよう提案する。

---

### 🎨 figma-diff — Figma ↔ 実装 差分検証

**パイプライン:** Figma ノード + 実装ファイル → 差分レポート → 関連: `/implement` 直後 or `/review` 前

Figma のデザインノードと実装（React/Tailwind）を突き合わせ、**視覚要素の乖離**と `data--annotations` に埋め込まれた**ビジネスルールの未反映**を検出する。

**特に重要:** `data--annotations`（アノテーション）はビジネスルール（例:「回答データがある場合は削除不可」）を含むため、視覚一致より優先して確認する。視覚要素が一致していてもアノテーション未反映は 🔴 扱い。

---

### 📝 commit — コミット

**パイプライン:** 実装完了 → コミット → 次は `/pr`

CLAUDE.md の Git 規約に沿ってコミットを作成する。コミット前に変更ファイルに応じたチェックを**自動実行**する。

| 差分 | 実行 |
| --- | --- |
| `backend/**/*.php` | `make pint`（自動整形） |
| `frontend/**/*.{ts,tsx,...}` | `make format` → `make lint` |
| `frontend/**/*.{ts,tsx}` | `make typecheck` |

lint エラー・型エラーが残った状態ではコミットしない。コミットメッセージ形式: `<type>: <概要（日本語）>`。承認後にコミット実行。

---

### 🚀 pr — Pull Request 作成

**パイプライン:** コミット済み → PR → CI 監視 → 完了報告

Git Flow に沿って PR を作成し、CI 完了まで自動監視。CI 失敗時は定型パターンを自己修復する。

**自己修復対象:**
- Prettier 未適用 → `make format` → コミット
- ESLint エラー → `make lintfix`
- PHP Pint 未適用 → `make pint`
- TypeScript 型エラー → 型定義を修正

PHPUnit / Jest の失敗は**自動修正しない**（ユーザーに原因確認）。同じ失敗が2回続いたらループを抜けてユーザーに報告。

---

### 🎫 issue — GitHub Issue 作成

**パイプライン:** `/requirements` → GitHub Issue → ブランチ名確定

要件定義をもとに、3パターンに対応して Issue を作成する。

| パターン | 粒度 |
| --- | --- |
| 新規開発 | 機能単位で複数 Issue |
| 追加開発 | 機能単位で1〜複数 Issue |
| 保守・バグ・エンハンス | 1 Issue = 1チケット |

**工数・納期はユーザーと対話で必ず決定する**（未定のまま作成しない）。承認後に `gh issue create` で作成。

---

## 🔁 開発フロー上の位置づけ

```
/requirements       # 要件定義
     ↓
/feature-design     # 機能設計（画面フロー・サーバー境界・ビジネスルール）
     ↓
/db-design          # DB設計（ER図・テーブル定義）
     ↓
/api-design         # API仕様設計
     ↓
/issue              # GitHub Issue 作成・ブランチ名確定
     ↓
/branch             # ブランチ作成
     ↓
/implement          # 実装（→ 完了後に自動で /review を起動）
     ↓
/figma-diff         # Figmaデザインと実装の突き合わせ（任意）
     ↓
/test-gen           # テスト生成
     ↓
/review             # コードレビュー（code-reviewer + Codex 並列）
     ↓
/refactor           # リファクタリング（任意）
     ↓
/commit             # コミット（format / lint / typecheck 自動実行）
     ↓
/pr                 # PR作成 + CI監視・自己修復
```

---

## 🛠️ 新規スキルの追加方法

1. `skills/{スキル名}/` ディレクトリを作成する。
2. `SKILL.md` にフロントマター（`name`, `description`, `model`, `tools` など）と動作仕様を記述する。
3. 本 `README.md` のスキル一覧・詳細・フローを更新する。

```yaml
# SKILL.md フロントマター例
---
name: my-skill
description: スキルの一行説明
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - Write
  - Edit
  - Bash
  - AskUserQuestion
disallowedTools:
  - mcp__*
maxTurns: 30
---
```
