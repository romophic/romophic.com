# Project Roadmap & Architecture

This document provides a comprehensive overview of the codebase structure, explaining the purpose of each key file and directory.

## Project Overview

This is a modern blog and portfolio website built with **Astro**, **React**, and **Tailwind CSS**. It features:

- **Static Site Generation (SSG)** with Astro.
- **Type-safe Content Collections** for blog posts, projects, and authors.
- **Hierarchical Blog Structure:** Supports "series" or sub-posts (posts nested within folders), with automatic navigation between parent and child posts.
- **React Components:** Used for interactive UI elements (shadcn/ui style).
- **MDX Support:** For rich content writing.
- **PWA Features:** Offline support via Vite PWA integration.

## Top-Level Configuration

| File                  | Description                                                                                                                                                           |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `astro.config.ts`     | Main Astro configuration. Configures integrations (React, Tailwind, Sitemap, MDX, PWA, Expressive Code for syntax highlighting) and markdown plugins (rehype/remark). |
| `package.json`        | Project metadata, scripts, and dependencies.                                                                                                                          |
| `tsconfig.json`       | TypeScript configuration. Defines the `@/*` alias pointing to `./src/*`.                                                                                              |
| `eslint.config.mjs`   | ESLint configuration for code linting.                                                                                                                                |
| `components.json`     | Configuration for `shadcn/ui` or similar component libraries.                                                                                                         |
| `.gitignore`          | Git ignore rules.                                                                                                                                                     |
| `tailwind.config.mjs` | (Implicit via integration, or loaded if present) Tailwind CSS configuration.                                                                                          |

## Source Code (`/src`)

The core application logic and content reside here.

### 1. Core Configuration & Globals

| File                | Description                                                                                                      |
| :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| `consts.ts`         | Site-wide constants: Site title, description, navigation links, and pagination settings.                         |
| `content.config.ts` | **Crucial.** Defines Zod schemas for `blog`, `projects`, and `authors` collections. Configures the glob loaders. |
| `env.d.ts`          | TypeScript type definitions for Astro environment and modules.                                                   |
| `types.ts`          | Custom TypeScript type definitions used across the project.                                                      |
| `pwa-sw.ts`         | Service worker configuration for Progressive Web App features.                                                   |

### 2. Components (`/src/components`)

A mix of Astro components (server-rendered/static) and React components (interactive).

**Astro Components:**
| File | Description |
| :--- | :--- |
| `Head.astro` | Base HTML `<head>` metadata (SEO, meta tags). |
| `Header.astro` | Site header/navigation bar. |
| `Footer.astro` | Site footer. |
| `Hero.astro` | Hero section for the landing page. |
| `BlogCard.astro` | Preview card for a blog post listing. |
| `ProjectCard.astro` | Preview card for a project listing. |
| `AuthorCard.astro` | Display card for author details. |
| `PageHead.astro`, `PostHead.astro` | Specialized head components for pages vs. blog posts. |
| `PostNavigation.astro` | Previous/Next links for blog posts. |
| `SubpostsHeader.astro`, `SubpostsSidebar.astro` | Navigation components specifically for hierarchical/series posts. |
| `TOCHeader.astro`, `TOCSidebar.astro` | Table of Contents components. |
| `Search.astro` | Search functionality implementation. |
| `ThemeToggle.astro` | Dark/Light mode switcher. |
| `ActivityGraph.astro` | Visual graph component (possibly for contribution/activity visualization). |
| `Breadcrumbs.astro` | Breadcrumb navigation. |
| `Callout.astro` | Custom MDX component for alert/info boxes. |
| `Link.astro`, `SocialIcons.astro`, `Favicons.astro` | Reusable small UI atoms. |

**React Components (`/src/components/ui`):**
Standard UI library components (likely shadcn/ui or similar): `button.tsx`, `badge.tsx`, `avatar.tsx`, `scroll-area.tsx`, `pagination.tsx`, `breadcrumb.tsx`, `separator.tsx`.

### 3. Content (`/src/content`)

Markdown and MDX files.

- **`blog/`**: Blog posts. Supports nesting.
  - _Standard Post:_ `folder/index.mdx` or `file.md`.
  - _Series/Sub-posts:_ A folder containing multiple `.mdx` files or subfolders. The project logic (`data-utils.ts`) treats these as connected content.
- **`projects/`**: Project portfolio entries.
- **`authors/`**: Author profiles (e.g., `romophic.md`).

### 4. Layouts (`/src/layouts`)

| File           | Description                                                                      |
| :------------- | :------------------------------------------------------------------------------- |
| `Layout.astro` | The main shell for all pages. Wraps content with `Head`, `Header`, and `Footer`. |

### 5. Library & Utilities (`/src/lib`)

| File            | Description                                                                                                                                               |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-utils.ts` | **Core Logic.** Functions to fetch, sort, and filter content collections. Implements the logic for "sub-posts" (detecting hierarchy based on file paths). |
| `utils.ts`      | Helper functions: `cn` (Tailwind class merging), `formatDate`, `readingTime`, `calculateWordCountFromHtml`.                                               |

### 6. Pages (`/src/pages`)

File-based routing.
| File | Description |
| :--- | :--- |
| `index.astro` | Homepage. |
| `about.astro` | About page. |
| `404.astro` | Custom 404 error page. |
| `rss.xml.ts` | Generates the RSS feed. |
| `robots.txt.ts` | Generates `robots.txt` dynamically. |
| **`blog/`** | Blog routing. |
| `blog/[...page].astro` | Paginated main blog index. |
| `blog/[...id].astro` | **Dynamic Post Route.** Renders individual blog posts. Uses `getStaticPaths` to build routes for all collection entries. |
| **`authors/`** | Author profile pages (`[...id].astro`) and index. |
| **`tags/`** | Tag archive pages (`[...id].astro`) and index. |
| **`og/`** | Dynamic Open Graph image generation (`[...slug].png.ts`). |

### 7. Styles (`/src/styles`)

| File             | Description                                                       |
| :--------------- | :---------------------------------------------------------------- |
| `global.css`     | Global CSS, Tailwind directive imports, and base theme variables. |
| `typography.css` | Typography-specific styles (fonts, prose settings).               |

## Public Assets (`/public`)

Static assets served at the root path (`/`).

- `fonts/`: Local font files.
- `static/`: Images used in the UI or content (logos, placeholders).
- `favicon*`: Favicons in various formats.
- `robots.txt`: (Likely overridden by the dynamic generator in `pages`).

## Feature Implementation & Adjustments Log

### 1. View Transitions

- **Status:** Completed
- **Details:** Astroの`ViewTransitions`コンポーネントを`src/layouts/Layout.astro`に追加し、ページ遷移を滑らかにしました。

### 2. Giscus Comment Functionality

- **Status:** Completed (using standard themes)
- **Details:**
  - 当初 `@giscus/react` を検討したが、Reactバージョン競合（`Invalid hook call`エラー）のため、Web Components版の`giscus`パッケージに切り替えました。
  - `src/components/GiscusComments.astro` を作成し、`giscus-widget` Web Componentsを直接利用する形式に変更。React依存を排除しました。
  - Giscusコメント機能をブログ記事ページ（`src/pages/blog/[...id].astro`）に組み込みました。
  - カスタムCSSファイル（`public/giscus-light.css`, `public/giscus-dark.css`）を作成し、サイトの配色に合わせたテーマの適用を試みました。
  - しかし、Giscusの仕様上、ローカル環境（`localhost`）から外部のGiscusサービスへカスタムCSSファイルをロードすることができない（セキュリティ制限のため）ことが判明しました。このため、ローカル開発中にカスタムテーマの正確な調整が困難でした。
  - 上記の問題と調整の手間を考慮し、カスタムテーマの採用は断念しました。
  - 最終的に、Giscusの標準テーマを使用するように変更しました。Lightモード時は `'light'` テーマ、Darkモード時は `'transparent_dark'` テーマが適用されます。
  - 不要になったカスタムCSSファイル (`public/giscus-light.css`, `public/giscus-dark.css`) は削除済みです。

### 3. Performance & Bandwidth Optimization

- **Item:** Astro Prefetching
- **Status:** Completed
- **Details:**
  - `astro.config.ts` で `prefetch: { defaultStrategy: 'viewport' }` を設定し、リンクがビューポートに入った時点で自動的にプリフェッチされるようにしました。
  - これにより、ページ遷移の体感速度が向上します。

- **Item:** React Reduction (ThemeToggle)
- **Status:** Completed
- **Details:**
  - `ThemeToggle` コンポーネントは既にWeb ComponentsとVanilla JSで実装されており、Reactハイドレーションのオーバーヘッドがないことを確認しました。

### 5. Refactoring & Performance Foundation (Day 2)

- **Item:** Technical Debt & Refactoring
- **Status:** Completed
- **Details:**
  - **Data Fetching Validation:** Confirmed that `getCollection('blog')` in `data-utils.ts` is performant (~5ms per call) and cached by Astro, so no N+1 refactoring was needed.
  - **Type Safety:** Removed unsafe `any` casts and non-null assertions in `src/pages/og/[...slug].png.ts`. Added robust error handling for font fetching.
  - **TOC Script Extraction:** Moved the monolithic scroll-spy logic from `TOCSidebar.astro` to a dedicated `src/lib/toc.ts` module, improving maintainability.
  - **CSS Cleanup:** Removed `!important` modifiers from `src/styles/typography.css` by using nested selectors to properly manage specificity.

- **Item:** OG Image Generation Optimization
- **Status:** Completed
- **Details:**
  - **File-System Caching:** Implemented a caching mechanism in `src/pages/og/[...slug].png.ts` using MD5 content hashes.
  - **Impact:** Reduced subsequent build times significantly (e.g., from 73s to 44s in local tests) by skipping image regeneration for unchanged content.

### 6. Extreme Performance Implementation (Day 3)

- **Item:** Font Subsetting & Optimization
- **Status:** Completed
- **Details:**
  - `@fontsource-variable/noto-sans-jp` を導入し、日本語フォントを最適化しました。
  - `src/layouts/Layout.astro` でインポートすることで、Tailwind CSS処理との競合を回避しました。

- **Item:** Partytown Integration
- **Status:** Completed
- **Details:**
  - `@astrojs/partytown` を導入し、サードパーティスクリプトをWeb Workerにオフロードする基盤を整えました。

- **Item:** Blurhash / LQIP Placeholders
- **Status:** Skipped (Deferred)
- **Details:**
  - 当初計画していましたが、Astroの`<Image />`コンポーネントの型定義エラー（`Property 'placeholder' does not exist`）が発生しました。
  - プロジェクトのビルド安定性を優先し、今回は実装を見送りました。将来的に解決策を調査します。

### 7. God-Tier UX Implementation (Day 3 - Continued)

- **Item:** Command Palette (Cmd+K)
- **Status:** Completed
- **Details:**
  - `cmdk` と `shadcn/ui` を使用してグローバルコマンドメニューを実装しました。
  - `Ctrl+K` (Windows) または `Cmd+K` (Mac) で呼び出し可能。ブログ記事の検索とナビゲーションを提供します。
  - ヘッダーの検索ボタンからもアクセス可能です。

- **Item:** Smart Link Previews
- **Status:** Completed
- **Details:**
  - `@floating-ui/react` を使用して、記事内の内部リンクにホバー時のプレビューカードを実装しました。
  - リンク先のOGメタデータを取得し、画像とタイトルを表示します。
  - SSR時の `Invalid hook call` エラーを回避するため、コンポーネントを `client:only="react"` としてマウントしました。

## Next Week's Strategy: Path to 1k Stars

This section outlines the strategic roadmap to achieve 1k GitHub stars and establish this project as the de-facto standard for personal blog templates. The focus is on balancing **Extreme Performance**, **Exceptional UX**, and **Developer Experience**.

### 0. Foundation & Technical Debt (Completed)
*Goal: Solidify the codebase, improve build stability, and ensure code maintainability before adding new features.*

| Task | Description | Status |
| :--- | :--- | :--- |

### 1. Extreme Performance (The "Speed" Pillar)
*Goal: Minimal bandwidth usage and instant interaction, regardless of network conditions.*

| Task | Description | Impact |
| :--- | :--- | :--- |
| **Font Subsetting & Optimization** | Generate optimized WOFF2 subsets for fonts (especially Japanese glyphs) to drastically reduce initial payload. Implement aggressive caching strategies. | High (Bandwidth/LCP) |
| **Blurhash / LQIP Placeholders** | Generate tiny, blurred placeholders (Base64) for all images at build time. Prevents layout shifts and improves perceived performance instantly. | High (UX/CLS) |
| **Partytown Integration** | Offload third-party scripts (Analytics, etc.) to a Web Worker using Partytown. Ensures the main thread remains free for user interactions (scrolling, clicking). | Medium (TBT) |

### 2. "God-Tier" UX (The "Feel" Pillar)
*Goal: A fluid, app-like experience that developers love.*

| Task | Description | Impact |
| :--- | :--- | :--- |
| **Command Palette (Cmd+K)** | Implement a global command menu (using `cmdk` or similar headless UI) for search, navigation, and theme toggling without leaving the keyboard. | Very High (Wow Factor) | **Completed** (Implemented using `cmdk` + shadcn/ui) |
| **Smart Link Previews** | Show a "Wikipedia-style" hovering preview card when hovering over internal links. Allows users to peek at content without navigating away. | High (Engagement) | **Completed** (Implemented using `@floating-ui/react`) |
| **Medium-style Image Zoom** | Implement a smooth, physics-based image zoom interaction using a lightweight solution (e.g., `react-medium-image-zoom` adapted or vanilla JS). | Medium (Polish) |
| **Copy-to-Clipboard & Diff View** | Enhance code blocks with a "Copy" button, file names, and diff highlighting support for better technical writing. | Medium (DX) |

### 3. Digital Garden Features (The "Knowledge" Pillar)
*Goal: Elevate the template from a simple blog to a knowledge management system.*

| Task | Description | Impact |
| :--- | :--- | :--- |
| **Bi-directional Links (Backlinks)** | Automatically detect and display a list of "Pages that link to this post" at the bottom of each article. Creates a mesh network of knowledge. | High (Differentiation) |
| **Interactive Graph View** | (Future) Visualize the connections between posts and tags in a 2D/3D graph, similar to Obsidian. | High (Visual Appeal) |

### 4. Developer Experience (DX)
*Goal: Easiest template to set up and customize.*

| Task | Description | Impact |
| :--- | :--- | :--- |
| **CLI Scaffolding Tool** | Create a simple script (e.g., `pnpm run new-post`) to interactively generate new MDX files with pre-filled frontmatter. | Medium (Usability) |
| **Theming Engine** | Refactor Tailwind config to allow changing the entire site's primary color via a single CSS variable or config option. | Medium (Customizability) |


### Workflow

1.  **Code Modification:** Implement changes or new features.
2.  **Lint & Format:** Always run the following commands before committing:
    - `pnpm prettier` (to format code)
    - `pnpm lint` (to check for code quality issues)
3.  **Fix Issues:** Resolve any errors or warnings reported by the linters.
4.  **Commit:** Stage and commit the changes only after they pass the checks.
5.  **Push:** Push commits to the remote repository after verifying locally.
