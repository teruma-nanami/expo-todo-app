# 実装

仕様ドキュメントをもとに、CLAUDE.md のアーキテクチャに沿って実装する。

## パイプライン

- 前提: 最低限 `/requirements` 完了（`/api-design` まで完了が理想）
- 読込: `docs/requirements/`, `docs/features/`, `docs/database/`, `docs/api/`
- 出力: ソースコード
- 次: `/test-gen`

## プロセス

### 1. 仕様確認

`docs/` 配下のドキュメントを読んで理解する。
実装対象が不明確な場合はユーザーに確認する。

### 2. 実装（CLAUDE.md の実装順序に従う）

**バックエンド:**

```
1. マイグレーション + Model（リレーション定義）
2. Repository（データアクセス：インターフェース + 実装 + DI バインド）
3. FormRequest（バリデーション）
4. Action（ビジネスロジック：Repository を DI で受け取る）
5. Service（必要な場合のみ：外部API・技術的処理）
6. Resource（レスポンス整形：アクションごとに分離）
7. Controller + ルーティング
```

コード配置に迷ったら CLAUDE.md の「コード配置の判断」決定木に従う。

**フロントエンド:**

```
1. types/（API仕様に合わせた型定義）
2. api/（通信関数）
3. hooks/（データ取得・ロジック）
4. components/（UI）
```

すべて `features/{機能名}/` 内に配置する。

### 3. 実装後チェック

- [ ] Controller は Action を呼ぶだけの薄い層か
- [ ] Action は `__invoke()` の単一責務か
- [ ] Action 内で Eloquent を直接使っていないか（Repository に委譲しているか）
- [ ] Repository にインターフェース（`Interfaces/Repositories/`）と DI バインドがあるか
- [ ] Service にインターフェース（`Interfaces/Services/`）と DI バインドがあるか
- [ ] Resource はアクションごとに分離され、フィールドが明示的に列挙されているか
- [ ] クラス参照は `use` 文でインポートしているか（`\Illuminate\Support\Str` のようなインラインフルパス指定禁止）
- [ ] 型宣言（引数・戻り値）があるか
- [ ] N+1 問題がないか（Repository 内で `with()` による Eager Loading）
- [ ] バリデーションが FormRequest で行われているか
- [ ] FormRequest に `attributes()` メソッドがあり、項目名が日本語で定義されているか
- [ ] エラーハンドリングが適切か
- [ ] フロントの機能コードが `features/{機能名}/` に閉じているか
- [ ] features 間の依存が型の import のみか

### 4. 自動レビュー（実装完了後に実行）

実装が完了したら、`/review` スキルを実行する。
`/review` が code-reviewer と Codex の並列レビューを行い、結果を統合して報告する。

🔴 重大の指摘がある場合は、ユーザーに修正するか確認してから対応する。自動修正は行わない。

## ルール

- CLAUDE.md のアーキテクチャとコーディング規約に準拠する
- 既存コードのパターンに合わせる
- スコープを広げすぎない（1機能に集中）
- 実装後のレビュー（ステップ4）を実行する
