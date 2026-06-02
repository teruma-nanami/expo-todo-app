# アーキテクチャ概要

## ディレクトリ構成

```
expo-todo-app/
├── app/                  # 画面（Expo Router）
│   ├── _layout.tsx       # ルートレイアウト（GestureHandlerRootView）
│   ├── index.tsx         # List Screen（TODO一覧）
│   └── add-edit.tsx      # Add/Edit Screen（追加・編集）
├── components/           # 再利用UIコンポーネント
│   └── TodoItem.tsx      # TODOアイテム（チェック・スワイプ削除）
├── hooks/                # カスタムフック
│   └── useTodos.ts       # AsyncStorage操作・状態管理
├── docs/                 # ドキュメント
├── assets/               # 画像・アイコン
├── global.css            # NativeWind エントリー
├── tailwind.config.js    # TailwindCSS設定
├── metro.config.js       # Metro bundler設定（NativeWind統合）
└── babel.config.js       # Babel設定（NativeWind変換）
```

---

## データフロー

```
[ List Screen / Add/Edit Screen ]
           ↕ 呼び出し
      [ useTodos.ts ]        ← 状態管理・CRUD操作
           ↕ 読み書き
     [ AsyncStorage ]        ← ローカル永続化
```

### useTodos の責務

| 関数 | 処理 |
| ---- | ---- |
| `loadTodos()` | AsyncStorageから全件取得 |
| `addTodo(title)` | 新規Todoを作成・保存 |
| `updateTodo(id, title)` | タイトルを更新・保存 |
| `toggleTodo(id)` | 完了フラグを切り替え・保存 |
| `deleteTodo(id)` | 対象Todoを削除・保存 |

---

## 画面遷移

```
List Screen
  ├── + ボタン → Add/Edit Screen（新規追加モード）
  └── アイテムタップ → Add/Edit Screen（編集モード）

Add/Edit Screen
  └── 保存 / キャンセル → List Screen に戻る
```

---

## データモデル

```ts
type Todo = {
  id: string        // UUID（crypto.randomUUID）
  title: string     // タイトル
  completed: boolean // 完了フラグ
  createdAt: string  // 作成日時（ISO 8601）
}
```

AsyncStorageには `JSON.stringify(Todo[])` で配列ごと保存する。

---

## 使用ライブラリ

| ライブラリ | 用途 |
| ---------- | ---- |
| Expo | React Nativeのビルド・開発環境 |
| Expo Router | ファイルベースのナビゲーション |
| NativeWind | TailwindCSSをReact Nativeで使用 |
| AsyncStorage | ローカルストレージ（キーバリュー形式） |
| react-native-gesture-handler | スワイプ操作の検出 |
| react-native-reanimated | スワイプアニメーション |
