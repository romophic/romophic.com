# romophic.com - Project Context

## 1. プロジェクトの概要と方針
romophic.com は、シンプルさ、パフォーマンス、そして純正機能を重視して構築されたミニマルな技術ブログです。
- ミニマリズム: 重い外部UIライブラリ（shadcn/ui や Reactコンポーネントなど）や複雑な抽象化を避け、純正のHTML/Tailwindクラスを使用します。
- ディレクトリ構成: 認知負荷を下げ見つけやすくするため、UIコンポーネントは階層化せずフラットに配置します。

## 2. Test as Documentation（仕様書としてのテスト）
コードの動作を説明するための仕様書は作成せず、Vitestのテストコードを「生きた仕様書」として扱います。

### 開発フロー (The "Vibe Loop")
1. 計画 & 仕様定義: 実装前に、期待する動作を自然言語で記述したテスト（`.test.ts`）を書く。
2. 実装: 複雑な抽象化を避け、純正機能を使って実装する。
3. 検証: テストを実行し、仕様を満たしていることを確認する。

シンプルに保ち、純正機能を使い、コードの正しさはテストに語らせること。

## 3. コマンド
- `pnpm test:run` — テスト（Vitest、1回実行）。実行前に `astro sync` を挟む。カバレッジ対象から `src/content.config.ts` は除外（ローダー関数は sync/build 時にしか走らず、テストでは 0% のまま function 閾値を割るため）。
- `pnpm test:coverage` — テスト + カバレッジ（閾値: lines/statements 92, functions 95, branches 85。CI はこちらを使用）
- `pnpm lint` — ESLint
- `pnpm typecheck` — astro check（型検査）
- `pnpm build` — 型検査 + 本番ビルド（Pagefind 索引を含む）

フェーズ完了の条件は常に「CI ゲート（lint / test / build（型検査を含む））が緑」。

### 開発サーバー / 検証
- `pnpm dev` — 開発サーバー（port 1234）。常駐は `pnpm astro dev --background`、管理は `astro dev stop|status|logs`。
- `pnpm astro preview --background` — 本番ビルドの検証用（`astro preview stop|status|logs`）。dev 起動中に依存の add / remove / update をすると Vite が 504 (Outdated Optimize Dep) を出すため、依存変更は dev 停止中に行い直後に再起動する。
- `pnpm astro build --timings` — ビルド内訳レポート（遅い箇所の特定）。

### 環境メモ
- Node は nvm-windows 管理（22.23.4。astro 7.4.2 以降の要件は ≥ 22.23.4）。`.nvmrc` と `engines` に固定済みで `nvm use` だけで揃う。
- KaTeX CSS は `KatexStyles.astro` 経由で数式を含む記事のみに読み込む（`hasMathContent` で判定）。`BaseLayout` へのグローバル import はしない。
- Web フォントは Astro Fonts API（`astro.config.ts` の `fonts` + Head の `<Font>`）で管理し、`global.css` は `var(--font-noto-sans-jp)` を参照する。`@fontsource-variable/noto-sans-jp` の直接 import はしない。preload は 124 チャンク構成のため意図的に未設定。
