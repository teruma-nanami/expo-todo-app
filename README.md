# expo-todo-app

Expo (React Native) で作るシンプルなモバイルTODOアプリです。  
Expo学習のポートフォリオとして作成しました。

---

## 画面構成

| 画面 | 概要 |
| ---- | ---- |
| List Screen | TODO一覧・完了トグル・スワイプ削除 |
| Add/Edit Screen | TODO追加・編集 |

---

## 技術スタック

| 項目 | 技術 |
| ---- | ---- |
| フレームワーク | [Expo](https://expo.dev/) (React Native) |
| 言語 | TypeScript |
| ナビゲーション | [Expo Router](https://expo.github.io/router/) |
| スタイリング | [NativeWind](https://www.nativewind.dev/) (TailwindCSS) |
| 永続化 | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |

---

## セットアップ

```bash
# 依存関係のインストール
make install

# 開発サーバーの起動
make start

# iOSシミュレーターで起動
make ios

# Androidエミュレーターで起動
make android
```

> iOSシミュレーターには Xcode、Android エミュレーターには Android Studio が必要です。

---

## コマンド一覧

```bash
make install    # 依存関係インストール
make start      # Expo開発サーバー起動
make ios        # iOSシミュレーター起動
make android    # Androidエミュレーター起動
make typecheck  # TypeScript型チェック
```

---

## ディレクトリ構成

```
expo-todo-app/
├── app/
│   ├── _layout.tsx       # ルートレイアウト
│   ├── index.tsx         # List Screen
│   └── add-edit.tsx      # Add/Edit Screen
├── components/
│   └── TodoItem.tsx      # TODOアイテムコンポーネント
├── hooks/
│   └── useTodos.ts       # AsyncStorage操作カスタムフック
├── docs/
│   └── requirements/     # 要件定義
├── assets/               # アイコン・画像
└── CLAUDE.md             # AI開発ガイド
```

---

## ドキュメント

- [要件定義](docs/requirements/todo-app.md)
