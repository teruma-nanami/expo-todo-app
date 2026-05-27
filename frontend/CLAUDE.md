# frontend/CLAUDE.md

応答・コード内コメント・コミットメッセージはすべて日本語で記述する。

マーキング定義はルート `CLAUDE.md` を参照。

---

## アーキテクチャ

### ディレクトリ構造

```
frontend/src/
├── app/                  # App Router
│   ├── ({アカウント種別})/ # 種別ごとのルートグループ
│   ├── (common)/         # 種別共通ページ
│   └── login/
├── components/
│   ├── elements/         # 共通UIパーツ（Button, Input, Modal）
│   │   └── forms/        # フォーム系パーツ
│   └── templates/        # ページテンプレート（MainLayout 等）
├── features/             # 機能単位モジュール
│   └── {機能名}/
│       ├── api/          # API通信関数
│       ├── components/   # 機能固有UI
│       ├── hooks/        # データ取得・ロジック
│       ├── types/        # 型定義
│       ├── constants/    # 定数
│       └── providers/    # React Context
├── hooks/                # 共通フック
├── lib/                  # 外部ライブラリのラッパー・初期化（fetch, dayjs, yup）
├── utils/                # プロジェクト固有のヘルパー関数
├── providers/            # グローバル Provider
└── constants/            # グローバル定数
```

### コード配置の判断

```
新しいコードを書くとき
├─ 外部ライブラリのラッパー・初期化？ → lib/
├─ 汎用ヘルパー関数（日付変換等）？ → utils/
├─ 複数機能で使うUIパーツ？ → components/elements/
├─ ページレイアウト？ → components/templates/
└─ 特定機能のコード → features/{機能名}/
   ├─ 型定義 → types/
   ├─ API通信 → api/
   ├─ データ取得・ロジック → hooks/
   ├─ 状態の共有 → providers/
   └─ UI → components/
```

### ルートグループ

- アカウント種別ごとに `({種別})/` で分離
- layout.tsx で `MainLayout` に `accountType` を渡してナビゲーションを切替
- 種別は `constants/accountType.ts` で一元管理
- 新種別追加: 定数追加 → ルートグループ作成 → layout.tsx 作成
- 種別共通ページは `(common)/`

### 設計ルール

[MUST] features 間の依存は型の import のみ許可。hooks / api の直接参照は禁止
[MUST] API通信は `lib/fetch.ts` の `http()` を使う（fetch API ベース、Sanctum 対応）

[SHOULD] 状態管理は React Context + カスタムフック
[SHOULD] フォームは react-hook-form + yup
[SHOULD] UI は HeroUI ベース

---

## 実装順序

```
1. types/（API仕様に合わせた型定義）
2. api/（通信関数）
3. hooks/（データ取得・ロジック）
4. components/（UI）
```

---

## Server / Client コンポーネント境界

**原則: Server Component をデフォルトとし、`"use client"` は対話性が必要な葉だけに付ける。**

判断フロー:

```
新しいコンポーネントを書くとき
├─ ブラウザ API（イベント、effect、localStorage）を使う？
│   └─ Yes → "use client" で分離（必要最小の葉コンポーネントに留める）
├─ フォーム入力・状態管理が必要？
│   └─ Yes → "use client"
├─ ナビゲーションフック（usePathname / useSearchParams）を使う？
│   └─ Yes → "use client" + 親で <Suspense> 境界を張る
└─ それ以外 → Server Component（デフォルト、"use client" 不要）
```

[MUST] `useSearchParams()` を使う Client Component は必ず親で `<Suspense>` で囲む

❌ `useSearchParams` を使うコンポーネントを Suspense なしで配置する
✅ `<Suspense fallback={<Loading />}><SearchParamsComponent /></Suspense>`

[MUST] Client Component にデータを渡すときは props として受け渡す（Client から `useEffect` で再取得しない）

[SHOULD] Client Component は「葉」に押し込む。コンテナは Server のまま、対話部分だけ Client に切り出す

[MUST] Server Component で機密情報（DB 直接操作、API トークン）を扱う場合も、返り値に漏らさない

---

## データ取得階層

```
URL / searchParams（ユーザー意図の Source of Truth）
    ↓
page.tsx (Server Component: パース + redirect + API 呼出)
    ↓
Server Component（props で下流に配布）
    ↓
Client Component（UI + 対話性のみ。再取得しない）
```

[SHOULD] ページング・フィルタ・ソートは URL クエリで表現（ブラウザ戻る・共有・リロードで再現可能に）
[MUST] 範囲外や不正な値は `page.tsx` で `redirect()` して正常化する

[SHOULD] Client Component での再フェッチは「対話による変更が即時反映されるべき」場合のみ
通常: page.tsx で fetch → props で渡す
例外: フィルタ変更の即時反映など、対話による変更が即時反映されるべき UX 要件がある場合

---

## `hooks/` を作る判断基準

`features/{機能}/hooks/` は **Client Component で再利用されるロジック** のみを置く。

| 条件                                             | hooks/ に置く？               |
| ------------------------------------------------ | ----------------------------- |
| Server Component からの 1 回限りのデータ取得     | ❌（`api/` の関数を直接呼ぶ） |
| 1 画面でしか使わない Client のデータ取得         | ❌（コンポーネント内に書く）  |
| 複数 Client Component で共通のデータ取得・副作用 | ✅                            |
| フォーム送信 + 成功/失敗ハンドリング             | ✅                            |

---

## 認証・認可レイヤ

**middleware → layout → page の 3 層で多重防御する。**

| 層                            | 責務                                                                           | 失敗時の挙動                              |
| ----------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| `middleware.ts`               | Cookie の有無で未認証を弾く                                                    | `/login` へ redirect                      |
| `(accountType)/layout.tsx`    | アカウント種別の一致を確認（例: 管理者ルートに一般ユーザーが侵入していないか） | 403 ページ or 該当種別のトップへ redirect |
| `page.tsx` / Server Component | リソース単位の認可（自分のデータか、権限があるか）                             | 403 or 404（存在を隠す）                  |

[MUST] 認可判定はサーバー側で行う。Client Component の条件分岐は UX 上の表示制御であって、セキュリティ境界ではない
[MUST] 「将来対応」として認証ガードを省略しない（早期に middleware を置く。認証未実装時は全通過の明示的な pass-through とし、実装時に中身を差し替える設計にする）

---

## パフォーマンス指針

[MUST] 画像は `next/image` を使う（最適化・lazy load）
[MUST] Server Component 内でループから `fetch` を呼ばない。まとめて 1 回で取得

[SHOULD] 重いモーダルやリッチテキストは `dynamic()` で遅延ロード
例外: 初期表示から必ず表示されるコンポーネントは不要

[SHOULD] Web フォントは `next/font/google` でロード（CLS 防止）
[SHOULD] 遅い非同期処理は `<Suspense>` で分割し、他の UI の描画をブロックしない

---

## セキュリティ指針

[MUST] `NEXT_PUBLIC_*` はバンドルに埋め込まれるので機密を入れない
[MUST] `target="_blank"` リンクには `rel="noopener noreferrer"` を付ける
[MUST] API トークン・セッションは Cookie（HttpOnly）で扱い、localStorage に置かない

[SHOULD] `dangerouslySetInnerHTML` は原則禁止
例外: 使う場合は DOMPurify 等でサニタイズ必須

[MUST] Server Actions を導入する場合は `"use server"` の公開 API として認可を必ず実装

---

## コーディング規約

### 基本

[MUST] 1関数 = 1責務
[MUST] マジックナンバー禁止（定数化）

[SHOULD] ネスト最大3階層（早期リターン）
例外: アルゴリズム上やむを得ない場合はレビュアーと合意

[MUST] 未使用コード即削除

### TypeScript / React

[MUST] strict mode、`make lint` / `make format` でフォーマット
[MUST] 関数コンポーネント + hooks
[MUST] `==` 禁止。`===` を使う

[SHOULD] `any` 禁止。`unknown` を使う
例外: サードパーティライブラリの型制約で回避できない場合のみ

[SHOULD] 非同期は `async/await`。`.then()` 禁止
例外: `Promise.all` と組み合わせるなど `async/await` より自然な場面

| 対象                       | 規則               |
| -------------------------- | ------------------ |
| 変数・関数                 | `camelCase`        |
| 型・コンポーネント         | `PascalCase`       |
| 定数                       | `UPPER_SNAKE_CASE` |
| ファイル（コンポーネント） | `PascalCase.tsx`   |
| ファイル（その他）         | `camelCase.ts`     |

---

## エラーハンドリング

[MUST] 想定内（バリデーション等）と想定外（障害）を区別
[MUST] 握りつぶし禁止。想定外は必ずログ記録
[MUST] ユーザーに内部情報（スタックトレース、SQL）を返さない
[MUST] カスタムエラーは `lib/errors.ts` に定義する
[MUST] 非同期エラーは try-catch 必須（未処理 rejection 禁止）

[FYI] `lib/fetch.ts` で通信エラーハンドリング（401 → ログインリダイレクト）

---

## E2E テスト（Playwright）

- 配置: `frontend/tests/e2e/`（`smoke.spec.ts`, `pages/`, `specs/`, `fixtures/`）
- 実行: リポジトリルートで `make e2e`、レポートは `make report`（ホスト Node 実行）
- 運用方針・ディレクトリ構成・セレクタ規約は `frontend/tests/e2e/README.md` を参照

---

## UI 専用スコープ実装規約（管理画面 `/admin/**` 限定）

※ 本セクションは API 非接続・mock-backed の UI 専用スコープ限定のルール

### mock-backed adapter

[MUST] データ取得は `api/{機能}.ts` の関数経由。`page.tsx` からの mock 直 import 禁止

❌ `import { MOCK_PROJECTS } from "@/features/projects/mocks/projects.mock"`
✅ `import { fetchProjects } from "@/features/projects/api/projects"`（中身は mock を返す）

[FYI] 将来 API を接続するとき `api/{機能}.ts` の中身だけを差し替えれば、`page.tsx`・components は変更不要になる。

**adapter の実装形式:**

```ts
// features/responses/api/responses.ts
import { MOCK_RESPONSE_OVERVIEW } from "@/features/responses/mocks/responses.mock";
import type { ResponseOverview } from "@/features/responses/types";

export async function fetchResponseOverview(
  projectId: string,
): Promise<ResponseOverview> {
  // 将来は API 呼び出しに差し替え（呼び出し側は変更不要）
  return MOCK_RESPONSE_OVERVIEW;
}
```

### mocks 規約

[MUST] 配置: `features/{機能}/mocks/{機能}.mock.ts`（1 ファイル）
[MUST] 命名: `MOCK_{複数形}`、`MOCK_{複数形}_EMPTY`、`MOCK_{単数形}`

[SHOULD] 件数は Pagination が発火する程度（20〜30 件）を用意する

### features 間の値共有

[MUST] 他 feature の mock 値を import 禁止（型の import のみ許可）

❌ `import { MOCK_QUESTIONS } from "@/features/questions/mocks/questions.mock"`
✅ 必要な軽量データは各 feature 内にインラインコピーで持つ

[FYI] feature 間で値が結合すると、リファクタリング時の影響範囲が予測できなくなる。共通化が必要になった時点で `lib/mocks/` に切り出す。

### searchParams 契約

[MUST] route owner は許容値・既定値・不正時 redirect 先を Issue に明記する
[MUST] 不正値は `page.tsx` で `redirect()` して正常化する

### Issue 粒度

[MUST] 1 Issue = 1 route。モーダル・状態違いを含む全てを同一 Issue で実装する

[FYI] モーダルを route owner と分けると動作確認に Storybook が必要になり管理コストが生じる。1人が route を通しで実装すると Figma との突き合わせが一度で済み、レビュアーも文脈が保たれて読みやすい。

### `"use client"` 境界の基本形

```
page.tsx (Server Component)
 ├ api/{機能}.ts 経由で mock 取得
 └ <FeatureRoot data={mock} />        ← Server Component（構造・セクション）
     ├ <FeatureTable rows={...} />    ← Server Component
     └ <FeatureInteractive />          ← "use client"（モーダル制御・フォーム）
```
