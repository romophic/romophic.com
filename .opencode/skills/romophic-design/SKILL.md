---
name: romophic-design
description: Use when designing or changing any visual output of romophic.com — UI components (.astro), Tailwind classes, global.css tokens, docs/*.html, or anything with layout/color/typography. Also use when a design risks looking generic or "AI-generated" (slop). Keywords: デザイン, UI, 見た目, コンポーネント, ページ, レイアウト, HTML, スキル, slop.
---

# romophic.com デザイン規約（anti-slop）

このリポジトリで見た目を作る・変えるときは、必ずこの規約に従う。
目的は「AIが量産したような、どのサイトにも見える汎用デザイン」を避け、
romophic.com 自身のデザイン言語と一貫させること。

## 1. 出発点は「この製品のブリーフ」。デフォルトから始めない

- 紫グラデーション、グラスモーフィズム風の全部盛り、角丸カードの反復、
  絵文字アイコン、中央寄せヒーロー＋3カラム機能紹介 —— これらは
  「何も決めていない」の言い換え。使うなら理由を言えるようにする。
- 判断に迷ったら「romophic.com の既存ページならどうするか」を基準にする。
- 参照: `docs/how-it-works.html` と `docs/refactoring-plan.html` が
  プロジェクト内ドキュメントの実例（単一ファイル・自己完結・ダーク対応）。

## 2. このプロジェクトのデザイン言語（実装済みの事実）

これが「正解」であり、新しい色・フォント・影を発明しない。

- **フォント**: Astro Fonts API の `Noto Sans JP Variable`（`var(--font-noto-sans-jp)`、
  Arial size-adjust フォールバック付き）。コードとメタ情報は `ui-monospace` 系スタック。
- **トークン**: `src/styles/global.css` の oklch 変数（`--background`,
  `--foreground`, `--muted-foreground`, `--border`, `--primary` …）。
  必ず Tailwind のセマンティッククラス（`bg-background`, `text-muted-foreground`,
  `border-border` 等）経由で使い、hex を直書きしない。
- **ライト/ダーク両対応が必須**。`:root` と `.dark` の両方で破綻しないか確認。
- **liquid glass**（`.liquid-glass`）は「ナビ・ヘッダ・モーダル」専用。
  使い所をコンテンツカードに広げない。
- **色は意味を持つ場所だけに**: 本文・UI は無彩色。色が許されるのは
  グラフのパレット（`GRAPH_CONFIG.theme.palettes`）、タグ、リンク強調など
  「データが色を運ぶ」場所のみ。
- **角丸は scale に従う**: sm 0.5 / md 0.75 / lg 1 / xl 1.25 / 2xl 1.5rem。
- **動き**: transition は color/border 系が基調（global.css の base 参照）。
  装飾アニメーションを足さない。

## 3. 階層は「箱」ではなく「文字と余白」で作る

- 情報のグルーピングは、まずタイポグラフィ・余白・罫線（border）で。
  カード化はカードである理由がある時だけ（独立した操作対象、比較対象など）。
- 罫線 1px + 背景色の差でパネルを表現するのがこのサイト流。大きな
  box-shadow を積み重ねない。
- 1画面にアクセント色は1つ。章番号やキッカーは連番が「本当に順序」の
  時だけ使う（パイプライン、手順）。全見出しへの ALL-CAPS 小見出しの
  反復はAIっぽさの典型なので禁止。
- グレースケールにしても階層が成立するか？ 成立しなければやり直す。

## 4. 文字で語る。装飾で誤魔化さない

- 見出しは具体的に。「次世代の」「シームレスな」等の空語、絵文字、
  感嘆符の乱用を避ける。日本語は「です・ます」基調、体言止め可。
- 数字・実ファイルパス・実コマンドで具体性を出す（例:
  「176 tests」「dist/og/*.png ×38」）。捏造した数値を書かない。
- アイコンは lucide / simple-icons（`ICONS` 定数、astro-icon）から。
  新規アイコンは `src/consts.ts` の `ICONS` に追加して使う。

## 5. アクセシビリティはデザインの一部

- フォーカス可能なものには `:focus-visible` を。フォーカスリングを消さない。
- コントラストは muted-foreground 以上。小さな淡色テキストの重ね掛け禁止。
- `prefers-reduced-motion` を尊重（アニメーションは media query で停止）。
- タップ領域・`aria-label`・`aria-current` を省略しない。

## 6. 仕上げ前チェックリスト

- [ ] `pnpm lint` と `pnpm test:run` が緑（UI変更はテストで固定されている）
- [ ] ライト/ダーク両方でスクリーンショット相当の確認をした
- [ ] 直書き hex / 新フォント / 新シャドウを追加していない
- [ ] そのデザインは「ロゴを他社に差し替えても成立する」汎用テンプレではないか？
      そうなら具体（コンテンツ・データ・言葉）に寄せ直す
- [ ] グレースケールで階層が読めるか
- [ ] スマホ幅（375px）で崩れていないか

## 参考（外部の良質なスキル）

- Anthropic `frontend-design`（claude-code plugin）— 一般則の原典。
  本スキルはその原則を romophic.com の実装事実に合わせて具体化したもの。
