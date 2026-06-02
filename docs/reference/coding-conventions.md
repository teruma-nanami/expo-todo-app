# コーディング規約（補足）

**作成日:** 2026-06-02

基本的な規約は `CLAUDE.md` に記載。このファイルは TypeScript・React Native 固有の判断基準を補足する。

---

## TypeScript

- `any` 禁止。型が不明な場合は `unknown` を使い、型ガードで絞り込む。
- 型エイリアスはファイルの先頭に定義する。`interface` より `type` を優先する。
- 関数の戻り値型は明示しない（推論に任せる）。ただし `async` 関数で `Promise<void>` が自明でない場合は明示する。

## コンポーネント

- 1ファイル1コンポーネント。デフォルトエクスポートを使う。
- Props 型はコンポーネントと同じファイルに定義し、`type XxxProps = {...}` と命名する。
- `React.FC` は使わない。関数宣言または `const Xxx = (props: XxxProps) => {}` で書く。

```ts
// ✅
type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => void
}

export default function TodoItem({ todo, onToggle }: TodoItemProps) { ... }

// ❌
const TodoItem: React.FC<TodoItemProps> = (props) => { ... }
```

## カスタムフック

- `use` プレフィックスを必ず付ける（`useTodos`、`useForm` など）。
- 状態と操作関数をまとめてオブジェクトで返す。

```ts
// ✅
return { todos, addTodo, updateTodo, toggleTodo, deleteTodo }
```

## NativeWind（スタイリング）

- クラス名は `className` prop に記述する。`StyleSheet.create` との混在は最小限にする。
- 条件付きスタイルは `clsx` または三項演算子で記述する。

```tsx
// ✅
<Text className={`text-base ${todo.completed ? 'line-through text-gray-400' : 'text-black'}`}>
```

## AsyncStorage

- キー名は定数として定義し、文字列リテラルの直書きを避ける。
- 読み書きは必ず `try/catch` でラップし、エラーを `console.error` に出力する。

```ts
const STORAGE_KEY = 'todos'

try {
  const json = await AsyncStorage.getItem(STORAGE_KEY)
  ...
} catch (e) {
  console.error('AsyncStorage 読み込みエラー:', e)
}
```

## ファイル命名

| 対象 | 規則 | 例 |
| --- | --- | --- |
| コンポーネント | PascalCase | `TodoItem.tsx` |
| フック | camelCase（use プレフィックス） | `useTodos.ts` |
| 画面（app/） | kebab-case | `add-edit.tsx` |
| 定数・ユーティリティ | camelCase | `storageKeys.ts` |
