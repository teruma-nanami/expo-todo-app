# backend/CLAUDE.md

応答・コード内コメント・コミットメッセージはすべて日本語で記述する。

マーキング定義はルート `CLAUDE.md` を参照。

---

## アーキテクチャ

### ディレクトリ構造

```
app/
├── Console/Commands/     # バッチ処理（Artisan コマンド）
├── Enums/                # 列挙型
├── Exceptions/           # グローバル例外ハンドラー
├── Http/
│   ├── Controllers/      # Request受付 → Action呼出 → Resource返却
│   ├── Middleware/        # 認証・権限
│   ├── Requests/         # FormRequest（バリデーション）
│   └── Resources/        # レスポンス整形（機能名ごとにサブディレクトリ）
├── Interfaces/           # インターフェース定義（抽象と実装の分離）
│   ├── Repositories/     # Repository のインターフェース
│   └── Services/         # Service のインターフェース
├── Models/               # Eloquent（リレーション、Attribute、Trait）
├── Notifications/        # メール・通知テンプレート
├── Providers/            # DI バインド（Interface → 実装）
├── Repositories/         # データアクセス層（インターフェースの実装）
├── Services/             # 外部API連携・技術的処理（インターフェースの実装）
└── UseCases/             # ビジネスロジック
    └── {機能名}/
        ├── {Action}Action.php
        └── Exceptions/
```

### 層の責務

| 層           | やること                                                  | やらないこと                             |
| ------------ | --------------------------------------------------------- | ---------------------------------------- |
| Controller   | Request 受付、Action 呼出、Resource 返却                  | ロジック、DB操作                         |
| Action       | ビジネスフローの組み立て、トランザクション管理            | HTTP処理、レスポンス整形、直接的なDB操作 |
| Repository   | データの取得・永続化（Eloquent 操作）                     | ビジネス判断、外部API                    |
| Service      | 外部API連携、技術的処理（PDF生成等）                      | ビジネスフローの組み立て、直接的なDB操作 |
| Model        | データ構造、リレーション、Attribute、Trait による共通計算 | ビジネスフロー、外部API                  |
| Notification | 通知チャネル（メール等）のテンプレートと送信              | ビジネス判断                             |

### コード配置の判断

```
新しいロジックを書くとき
├─ バッチ処理？ → Console/Commands/
├─ 通知テンプレート？ → Notifications/
├─ DB の取得・永続化？ → Interfaces/Repositories/ にインターフェース、Repositories/ に実装
├─ 外部API or 技術的処理？ → Interfaces/Services/ にインターフェース、Services/ に実装
├─ 複数 Model で共通の計算ロジック？ → Model の Trait
├─ データの算出方法・表示形式？ → Model の Attribute
└─ 上記以外のビジネスロジック → UseCases/{機能}/Action
```

---

## 実装順序

```
1. マイグレーション + Model（リレーション定義）
2. Repository（データアクセス：インターフェース + 実装 + DI バインド）
3. FormRequest（バリデーション）
4. Action（ビジネスロジック：Repository を DI で受け取る）
5. Service（必要な場合のみ：外部API・技術的処理）
6. Resource（レスポンス整形：アクションごとに分離）
7. Controller + ルーティング
```

---

## 層の実装ルール

### Action

[MUST] `__invoke()` 単一責務。Action 間の呼び出し禁止
[MUST] Eloquent を直接使わない。Repository に委譲する
[MUST] トランザクション管理は Action 内で `DB::transaction()` を使う
[MUST] Repository・Service はコンストラクタインジェクションで受け取る

### Repository

[MUST] インターフェースは `Interfaces/Repositories/` に定義し、`AppServiceProvider` で DI バインド
[MUST] Eloquent の操作は Repository 内に閉じる
[MUST] Repository 間の呼び出し禁止。必要なら Action 側で組み合わせる

[SHOULD] Model 単位で作成する（例: `OrderRepository` は `Order` と `OrderItem` を扱う）
例外: レポート集計など複数の無関係な Model をまたぐ場合はレビュアーと相談

### Service

[MUST] インターフェースは `Interfaces/Services/` に定義し、`AppServiceProvider` で DI バインド
[MUST] DB 操作は Repository に委譲する。Service 内で Eloquent を直接使わない
[MUST] Action とのトランザクションネスト禁止
[MUST] 作成基準: 外部API / 技術的処理（PDF生成、ファイルアップロード等）のみ。ビジネスロジックは Action の責務

---

## API レスポンス規約

### Resource

[MUST] レスポンスは必ず専用の Resource クラスを通して返す

❌ `return response()->json(['id' => $user->id])`
✅ `return new ShowUserResource($user)`

[MUST] ボディが不要な場合は `response()->noContent()`（204）

**Controller での返し方:**

```php
// 一覧（ResourceCollection として返却）
return IndexAdminResource::collection($admins);

// 詳細・作成・更新（単一リソース）
return new ShowAdminResource($admin);

// 削除等（レスポンスボディ不要）
return response()->noContent();  // 204
```

**配置とファイル命名:**

```
App\Http\Resources\{機能名}\
├── Index{Model}Resource.php    # 一覧用
├── Show{Model}Resource.php     # 詳細用
├── Store{Model}Resource.php    # 作成レスポンス用（必要な場合）
└── Update{Model}Resource.php   # 更新レスポンス用（必要な場合）
```

[MUST] アクションごとに Resource を分ける（一覧と詳細で返すフィールドが異なるため）
[MUST] Laravel Resource のデフォルト `data` ラッピングをそのまま利用する

[MUST] `toArray()` 内で返すフィールドは明示的に列挙する

❌ `return parent::toArray($request);`
✅ `return ['id' => $this->id, 'name' => $this->name];`

### ステータスコード

| コード | 用途                                    | Controller の返し方                         |
| ------ | --------------------------------------- | ------------------------------------------- |
| 200    | 成功                                    | `return new Show{Model}Resource(...)`       |
| 201    | 作成成功                                | `return new Store{Model}Resource(...), 201` |
| 204    | 成功（ボディなし）                      | `return response()->noContent()`            |
| 401    | 未認証                                  | フロントで自動ログインリダイレクト          |
| 403    | 権限なし                                | —                                           |
| 404    | リソース未検出                          | —                                           |
| 422    | バリデーション / ビジネスロジックエラー | —                                           |
| 500    | サーバーエラー（内部情報を返さない）    | —                                           |

### エラーレスポンス

エラーは `Handler.php` で一元整形。

```json
// 422 バリデーションエラー
{ "message": "...", "errors": { "email": ["..."], "name": ["..."] } }

// その他（401, 403, 404, 500 等）
{ "message": "..." }
```

---

## DB 設計規約

[MUST] テーブル名: 複数形 `snake_case`（例: `order_items`）
[MUST] カラム名: `snake_case`
[MUST] 必須カラム: `id`, `created_at`, `updated_at`

[SHOULD] 論理削除: `deleted_at`（SoftDeletes）
例外: ピボットテーブル・ログテーブルなど物理削除で十分なケース

[MUST] 外部キー: `{単数形テーブル名}_id`（例: `user_id`）

### ID 戦略（詳細は [ADR-0003](../docs/decisions/0003-id-strategy.md)）

| 種別                      | 用途                                                                                                    | 例                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **ULID** (char 26)        | URL パスに出る or 外部参照される識別子。推測困難性が必要                                                | `projects.id`, `master_questions.id`, `admins.id`, `categories.id`, `tags.id`, `choice_versions.id`, `choices.id`  |
| **bigint** AUTO_INCREMENT | 内部参照のみで、外部 API パスに出ない subordinate なエンティティ。または大量行 FK 参照を受けるテーブル | `survey_questions.id`, `survey_choices.id`, `master_question_tag.id`, `responses.id`                               |
| **tinyint** unsigned      | 固定値マスタ（PHP Enum と整合する小さな辞書）                                                           | `distribution_channels.id`, `projects.status_id`, `*.question_type_id`                                             |

判断フロー: ① Enum 化できる固定値? → tinyint / ② URL に出る? → ULID / ③ それ以外 → bigint

PHP Enum との連携は `protected $casts = ['xxx_id' => XxxEnum::class]` で backed enum と相互変換する。

---

## コーディング規約

### 基本

[MUST] 1関数 = 1責務
[MUST] マジックナンバー禁止（定数化）

[SHOULD] ネスト最大3階層（早期リターン）
例外: アルゴリズム上やむを得ない場合はレビュアーと合意

[MUST] 未使用コード即削除

### PHP / Laravel

[MUST] PSR-12 準拠、`make pint` でフォーマット
[MUST] 型宣言（引数・戻り値）必須

[MUST] クラス参照は `use` 文でインポートして短縮名を使う

❌ `\Illuminate\Support\Str::random(40)`
✅ `use Illuminate\Support\Str;` → `Str::random(40)`

| 対象             | 規則               |
| ---------------- | ------------------ |
| 変数・メソッド   | `camelCase`        |
| クラス           | `PascalCase`       |
| 定数             | `UPPER_SNAKE_CASE` |
| テーブル・カラム | `snake_case`       |

### データアクセス

[MUST] N+1 を作らない。`with()` で Eager Loading する

❌ ループ内でリレーションを参照する

```php
foreach ($orders as $order) {
    echo $order->items; // N+1 が発生する
}
```

✅ Eager Loading でまとめて取得する

```php
$orders = Order::with('items')->get();
```

### FormRequest

[MUST] `attributes()` メソッドを定義し、バリデーションメッセージの項目名を日本語で返す

---

## エラーハンドリング

[MUST] 想定内（バリデーション等）と想定外（障害）を区別
[MUST] 握りつぶし禁止。想定外は必ずログ記録
[MUST] ユーザーに内部情報（スタックトレース、SQL）を返さない
[MUST] ドメイン例外は `UseCases/{機能}/Exceptions/` に定義し、`Handler.php` で一元キャッチ → HTTP レスポンス変換
[MUST] 外部API は try-catch 必須

[SHOULD] バルク処理は部分成功を許容する設計にする（成功件数・失敗件数・失敗理由をレスポンスに含める）

---

## テスト（PHPUnit）

- `tests/Unit/`: 単体テスト（Action, Repository, Service）
- `tests/Feature/`: 結合テスト（APIエンドポイント単位）
- メソッド名は日本語可: `test_ユーザーが正常に作成される()`
