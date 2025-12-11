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

## Future Improvements & Optimization Plan

### 1. Performance & Bandwidth Optimization

| Item                          | Description                                                                                                                                | Priority |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| **Image Optimization (AVIF)** | Enforce AVIF format for `astro:assets` to reduce file size compared to WebP.                                                               | High     |
| **Responsive Images**         | Implement `<picture>` tags with `srcset` and `sizes` to serve appropriately sized images for mobile vs. desktop (Art Direction).           | Medium   |
| **Font Subsetting**           | Create subset woff2 files for `Geist` font containing only used glyphs (English, Japanese, Symbols) to reduce initial download size.       | Medium   |
| **Font Display Strategy**     | Ensure `font-display: swap` is applied globally to prevent FOIT (Flash of Invisible Text).                                                 | High     |
| **React Reduction**           | Rewrite simple interactive components (like `ThemeToggle`) to Vanilla JS or Web Components to remove unnecessary React hydration overhead. | Medium   |
| **Partytown Integration**     | Offload third-party scripts (Analytics, etc.) to a web worker using `@astrojs/partytown`.                                                  | Low      |
| **Astro Prefetching**         | Enable Astro's view transition prefetching (`prefetch: true`) for instant page loads on hover/viewport visibility.                         | High     |

### 2. User Experience (UX) & Features

| Item                         | Description                                                                                                                  | Priority |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------- |
| **Command Palette (Cmd+K)**  | Implement a global search modal accessible via keyboard shortcut (Cmd+K) for quick navigation.                               | High     |
| **Sticky Table of Contents** | Make the TOC in the sidebar sticky and highlight the active section while scrolling.                                         | Medium   |
| **Reading Progress Bar**     | Add a visual progress indicator at the top of the page for long blog posts.                                                  | Low      |
| **Rich Diagrams (Mermaid)**  | Support `mermaid.js` in Markdown for rendering flowcharts and diagrams natively.                                             | Low      |
| **Link Previews**            | Show a tooltip preview (Wikipedia-style) when hovering over internal links.                                                  | Low      |
| **Optimized Embeds**         | Use lightweight facades (e.g., `lite-youtube-embed`) for YouTube/Twitter embeds to avoid loading heavy iframes on page load. | Medium   |
| **Citation Tool**            | Add a "Cite this post" button to copy BibTeX or text citations.                                                              | Low      |

### 3. Accessibility (a11y)

| Item                          | Description                                                                      | Priority |
| :---------------------------- | :------------------------------------------------------------------------------- | :------- |
| **Skip Link**                 | Add a "Skip to Content" link for keyboard users to bypass navigation.            | High     |
| **Enhanced Focus Indicators** | Improve `:focus-visible` styles to be highly visible yet aesthetically pleasing. | Medium   |
| **Dark Mode Image Dimming**   | Apply a brightness filter to images in dark mode to reduce eye strain.           | Low      |

### 4. SEO & Security

| Item                              | Description                                                                                                         | Priority |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :------- |
| **Structured Data (JSON-LD)**     | Implement full Schema.org structured data (Article, BreadcrumbList, Person) for better search engine understanding. | High     |
| **Content Security Policy (CSP)** | Configure strict CSP headers to prevent XSS and unauthorized resource loading.                                      | Medium   |
| **Security Headers**              | Implement HSTS, X-Content-Type-Options, and X-Frame-Options headers.                                                | Medium   |

### 5. DevOps & Code Quality

| Item                      | Description                                                                                       | Priority |
| :------------------------ | :------------------------------------------------------------------------------------------------ | :------- |
| **Git Hooks (Lefthook)**  | Introduce `lefthook` to enforce `lint` and `prettier` checks before every commit automatically.   | High     |
| **Dependency Automation** | Set up Renovate or Dependabot to keep dependencies up-to-date automatically.                      | Medium   |
| **Migration to Biome**    | Consider migrating from ESLint/Prettier to Biome for faster linting and formatting in the future. | Low      |

## Development Guidelines

### Workflow

1.  **Code Modification:** Implement changes or new features.
2.  **Lint & Format:** Always run the following commands before committing:
    - `pnpm prettier` (to format code)
    - `pnpm lint` (to check for code quality issues)
3.  **Fix Issues:** Resolve any errors or warnings reported by the linters.
4.  **Commit:** Stage and commit the changes only after they pass the checks.
5.  **Push:** Push commits to the remote repository after verifying locally.
