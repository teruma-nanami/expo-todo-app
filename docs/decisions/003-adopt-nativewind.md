# 003: NativeWind の採用

**ステータス:** 採用  
**決定日:** 2026-06-02

## コンテキスト

React Native のスタイリングは `StyleSheet.create` によるオブジェクト記法が基本だが、Web の TailwindCSS に慣れた開発者にとっては冗長で切り替えコストが高い。ユーティリティファーストで素早くスタイルを当てられる手段を検討した。

## 決定内容

NativeWind v4（TailwindCSS for React Native）を採用する。

## 理由

- **TailwindCSS との統一**: Web 開発で使い慣れたクラス名がそのまま使えるため、スタイリングの学習コストがゼロに近い。
- **インラインスタイルの排除**: `className` 属性で記述できるため、コンポーネントとスタイルが一体化して読みやすい。
- **デザイン制約の統一**: Tailwind のデザイントークン（色・スペーシング等）を共有することで、一貫したUIが作りやすい。

## 検討した代替案

| 案 | 却下理由 |
| --- | --- |
| `StyleSheet.create`（React Native 標準） | オブジェクト記法で冗長になりやすく、Web スキルとの乖離が大きい。 |
| styled-components / emotion | ランタイムコストが高く、React Native での対応が限定的。 |
| Tamagui | 設定・セットアップが複雑で、小規模ポートフォリオには過剰。 |

## 影響・トレードオフ

- `metro.config.js` と `babel.config.js` に NativeWind 用の設定が必要で、プロジェクト設定が増える。
- NativeWind が未対応の React Native スタイルプロパティは `StyleSheet` を併用する必要がある。
- v4 は破壊的変更が多く、v2/v3 の情報がそのまま使えない場合がある。
