# GEMINI Project Context

## 0. Meta-Instruction: Maintaining This Document

**This file is a living document and MUST NOT be summarized or truncated.**

- **Read First:** Before starting any task, read this file to understand the current architecture and conventions.
- **Update Always:** Whenever you change the project structure, add new features, modify core logic, or establish new patterns, **you MUST update this file**.
- **No Omissions:** When editing this file, **DO NOT delete or summarize existing information**. Every detail, especially implementation notes and philosophical contexts, must be preserved.
- **Prefer `replace`:** Use the `replace` tool for targeted, incremental updates. Avoid overwriting the entire file with `write_file` unless absolutely necessary, to prevent accidental information loss.
- **Verification:** Always perform a `read_file` immediately before an update to ensure you are working with the most recent version.
- **Truth:** Ensure this file remains the "Single Source of Truth" for the codebase.

This document provides a comprehensive and deep technical overview of **romophic.com**. It is designed to be the single source of truth for AI agents and developers working on the codebase, synthesizing information from the file structure, configuration, and implementation details.

## 1. Project Identity & Philosophy

**romophic.com** is a high-performance, technical digital garden designed for deep interconnectedness and "God-Tier" UX.

- **Core Values:**
  - **Performance:** Static Generation (SSG) first. Minimal client-side JS.
  - **Interconnectivity:** Bi-directional linking, graph visualizations, and nested content structures.
  - **Ergonomics:** "Vibe Coding" workflow — fast, intuitive, and type-safe.
- **Aesthetics:** Minimalist, typography-focused, dark/light mode adaptive (system sync).

## 2. Technical Architecture & Tech Stack

### Navigation Structure
- **Blog:** Chronological list of posts.
- **Authors:** Contributor profiles.
- **Graph:** Knowledge graph visualization of post connections.
- **About:** Personal introduction and site philosophy.

### Framework & Core Libraries

- **Framework:** [Astro v5](https://astro.build/) (Strict SSG, Zero-JS by default)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (configured via `@tailwindcss/vite`)
  - **Theme Strategy:** CSS Variables in `src/styles/global.css` (`--background`, `--foreground`, etc.) combined with `oklch` colors.
  - **Fonts:** `Geist` (Sans) and `Geist Mono` (Monospace).
- **Content:** MDX
  - **Remark Plugins:** `remark-math` (Math support), `remark-emoji`.
  - **Rehype Plugins:** `rehype-katex` (Math rendering), `rehype-external-links`, `rehype-heading-ids`, `rehype-autolink-headings` (Anchor links).
- **Search:** [Pagefind](https://pagefind.app/) (Static search index)
- **Visualization:**
  - **Core Architecture:** `d3-force` + `d3-zoom` + `d3-drag` driving a raw HTML5 Canvas.
  - **Custom Interaction:** Manual hit-testing and coordinate transformation (`screen2GraphCoords`) for 100% reliability.

### Directory Structure & Codebase Complete Map

#### `src/components/` (UI Components)
- **`ui/`**: Atomic, generic UI primitives.
    - `button.astro`, `badge.astro`, `separator.astro`
- **`blog/`**: Post-specific UI elements.
    - `Backlinks.astro`: Lists incoming links to the current post.
    - `BlogCard.astro`: Preview card for post lists (used in `/blog` and Home).
    - `PostHeader.astro`: Post metadata (title, date, tags, reading time).
    - `PostNavigation.astro`: Contextual Next/Prev links.
    - `SubpostsHeader.astro`: Navigation for series/books (mobile/top).
    - `SubpostsSidebar.astro`: Navigation for series/books (desktop sidebar).
    - `TOCHeader.astro`: Table of Contents for mobile.
    - `TOCSidebar.astro`: Table of Contents for desktop.
- **`scripts/`**: Client-side logic managers.
    - `AppScript.astro`: **Crucial.** Central manager for theme initialization and global scripts across transitions (astro:page-load).
- **`common/`**: Reusable blocks.
    - `AuthorCard.astro`: Profile display for authors.
    - `CopyCodeManager.astro`: Adds copy buttons to code blocks.
    - `Favicons.astro`: Favicon link tags.
    - `Hero.astro`: The personal introduction section on the homepage.
    - `Link.astro`: Wrapper for `<a>` tags with prefetching.
    - `MDXImage.astro`: Server-side image optimization wrapper.
    - `ProjectCard.astro`: Portfolio project card.
    - `ScrollProgress.astro`: Reading progress bar.
    - `ScrollToTop.astro`: Scroll to top button.
    - `SocialIcons.astro`: Social media icons.
- **`features/`**: Complex components encapsulating larger logic.
    - `GraphView.astro`: The Knowledge Graph implementation (Pure SSG, D3 + Canvas natively invoked).
    - `ActivityGraph.astro`: GitHub-style contribution heatmap.
    - `GiscusComments.astro`: Comment system integration.
    - `PageLoader.astro`: Page transition loader.
- **`layout/`**: Structural components.
    - `Header.astro`: Navigation bar.
    - `Footer.astro`: Site footer with social links.
    - `Head.astro`: Global `<head>` contents.
    - `PageHead.astro`: SEO and meta tags per page.
    - `SearchDialog.astro`: Native `<dialog>` for Pagefind static search integration.
    - `ThemeToggle.astro`: Switch button for dark/light mode.

#### `src/content/` (Data Source)
- **`authors/`**: Author metadata in `.md`.
- **`blog/`**: MDX posts. Supports nested folders (e.g., `romophic-library/lib/`).
- **`projects/`**: Project descriptions in `.md`.

#### `src/lib/` (Core Logic)
- **`content/`**: Atomic fetchers and parsers.
    - `posts.ts`: Post loading, sorting, and sibling resolution (Subposts). **Memoized** to optimize build performance.
    - `links.ts`: Backlink indexing and resolution using an O(N) inverted index map.
    - `authors.ts`: Author data resolution.
    - `toc.ts`: Server-side TOC data generation.
- `data-utils.ts`: **Central Orchestrator.** Aggregates all data for a page (`getPostPageData`). Runs parallel fetches for performance.
- `toc.ts`: Client-side Scroll Spy controller (rAF optimized).
- `utils.ts`: General helpers (formatting, word counts).

#### `src/pages/` (Routes)
- `blog/[...id].astro`: Dynamic catch-all for every blog post.
- `blog/[...page].astro`: Paginated list of blog posts.
- `graph.astro`: The Knowledge Graph page.
- `graph.json.ts`: API endpoint serving nodes and links for the graph visualization.
- `og/[...slug].png.ts`: Dynamic OG Image generator (Satori + Resvg).
- `rss.xml.ts`, `robots.txt.ts`, `llms.txt.ts`: Meta-feeds. **Robots.txt is now strictly standardized.**

## 3. Deep Dive: Architecture & Implementation Details

### 3.1. Content Data Flow & Rendering Pipeline

The entire site revolves around the `blog` content collection. The rendering pipeline is designed for concurrency and performance:

1.  **Loading (`src/content.config.ts`):**
    - Uses `glob` loader to ingest files from `src/content/blog`.
    - **Schema:** `title`, `description`, `date`, `order` (optional), `image` (optional), `tags`, `authors`, `draft`.
2.  **Route Generation (`src/pages/blog/[...id].astro`):**
    - `getStaticPaths` calls `getAllPostsAndSubposts` (from `src/lib/data-utils.ts`).
    - It generates routes for _every_ MDX file, preserving the file path as the ID.
3.  **Data Aggregation (`src/lib/data-utils.ts`):**
    - **Central Orchestrator:** `getPostPageData` serves as the single entry point for page generation.
    - **Parallel Execution:** It orchestrates multiple async operations concurrently via `Promise.all`:
      - `parseAuthors`: Resolves author IDs to author data.
      - `getAdjacentPosts`: Determines Next/Prev links based on hierarchy.
      - `hasSubposts` / `getSubpostCount`: Checks for children.
      - `getPostReadingTime`: Calculates reading time.
      - `getBacklinks`: Scans for incoming links.
      - `getTOCSections`: Generates the Table of Contents.
4.  **Rendering:**
    - `Astro.render()` compiles the MDX to HTML.
    - **No Islands:** Interactive components (like `GraphView` or `GiscusComments`) use standard Web Components, Astro Scripts, or native browser primitives rather than heavy framework hydration.

### 3.2. Subpost (Book/Series) Logic Specification

The project implements a custom "Subpost" pattern to support book-like content (e.g., `romophic-library`).

- **Logic Location:** `src/lib/content/posts.ts`
- **Definition:** A post is considered a "Subpost" if its ID contains a forward slash (`/`).
  - `isSubpost(id)`: `id.includes('/')`
- **Parent Resolution:**
  - `getParentId(id)`: Returns the immediate parent path (e.g., `a/b/c` -> `a/b`).
  - **Support:** Fully supports multi-level nested hierarchies.
- **Navigation (`getAdjacentPosts`):**
  - **Subposts:** Navigation is restricted to siblings sharing the same immediate Parent ID. Sorted by `order` (ascending) first, then `date` (descending).
  - **Top-level:** Navigation is across all top-level posts.
- **Reading Time:**
  - For Parent posts, `getCombinedReadingTime` aggregates the reading time of the parent _plus_ all its recursive subposts.

### 3.3. Knowledge Graph & Backlinks Engine

The project features a bi-directional linking system and a visualization graph.

- **Backlink Logic (`src/lib/content/links.ts`):**
  - **Method:** Inverted Index Map (`_backlinksMap`).
  - **Pattern:** `/\[.*?\]\((.*?)\)/g` (Standard Markdown links).
  - **Complexity:** $O(N)$ where N is the total number of posts. Cached during build.
  - **Resolution:** Handles absolute (`/blog/foo`) and relative (`../foo`) paths, normalizing IDs (removing `/index`).

- **Graph Visualization (`GraphView.tsx`):**
  - **Engine:** Custom D3-force simulation.
  - **Rendering:** HTML5 Canvas for $O(1)$ draw performance.
  - **Visuals:**
    - **Particle Flow:** Animated particles travel along links to visualize connection flow.
    - **Glow Effects:** Dynamic `shadowBlur` creates a neon/bloom effect, optimized for both Light and Dark modes.
    - **Glassmorphism:** Labels feature a semi-transparent blurred background for readability.
    - **LOD (Level of Detail):** Labels appear based on zoom level and node importance (degree).
  - **Interaction:**
    - Manual hit-testing using `d3.zoomTransform` inversion and distance calculation ensures 100% reliable clicking and hovering.
    - Supports Zoom, Pan, and Node Dragging.
  - **Configuration:** All physics and theme parameters are centralized in `src/consts.ts` under `GRAPH_CONFIG`.

### 3.4. Search & Link Previews

- **Search Engine:** **Pagefind** (Static Search, `@pagefind/default-ui`) indexed post-build.
- **Integration:** Native HTML5 `<dialog>` component (`SearchDialog.astro`) wrapped with a lightweight Astro script payload. 
- **UX Optimization:** Submits standard search queries via `astro-pagefind` natively instead of heavy `React-Cmdk` combinations for a drastic bundle size reduction.
- **Link Previews (`GlobalLinkPreviews.tsx`):**
  - Client-side component that intercepts hover events on internal links.
  - Fetches and parses target HTML metadata.
  - **Fix:** Resolves relative `og:image` paths to absolute URLs to prevent 404s.

### 3.5. Image Optimization Pipeline (LQIP)

1.  **Input:** Local images in `src/content/...` or external URLs.
2.  **Processing (`MDXImage.astro`):**
    - Calls `getImage()` (Astro Assets) to generate a **20px wide, 50% quality WebP** version of the image. This serves as the "BlurHash" style placeholder.
3.  **Client-Side:**
    - **Modern LQIP**: Implements Low Quality Image Placeholders using **CSS Grid Stacking**.
    - **Implementation:** Both placeholder and main image occupy `grid-area: 1/1`.
    - **Visual:** A 20px blurred WebP placeholder is layered behind the main image (`filter: blur(40px)`, `scale(1.2)`).
    - **Transition:** Smooth 1000ms cross-fade transition upon image load completion to prevent layout shifts.

### 3.6. Table of Contents (Client-Side Logic)

- **Source:** `src/lib/toc.ts`
- **Pattern:** Active Scroll Spy with `requestAnimationFrame` optimization.
- **Performance:** Throttled scroll handling to prevent layout thrashing.

### 3.7. Global Script Management (AppScript)

- **Source:** `src/components/common/AppScript.astro`
- **Purpose:** Centralizes all **global** client-side logic (Theme management, Giscus configuration, etc.) to ensure reliable execution across page transitions.
- **Component Scripts:** Component-specific UI logic (e.g., scroll-to-top, copy buttons) remains within the component but **MUST** use `astro:page-load` or Web Components to support View Transitions.
- **Theme Transitions:**
  - `global.css` enforces `transition-colors` (300ms) on all major elements to ensure a smooth, fluid experience when toggling between Light and Dark modes, even outside of View Transitions.

### 3.8. Icon System

- **Primary Source:** Native custom icons in `public/icon.webp` (generated via old `scripts/generate-icons.ts` which has since been removed).
- **UI Icons:** `@iconify-json/lucide` is utilized via `astro-icon` (`<Icon name="lucide:arrow-right" />`).
  - **Performance Note:** While heavy in `node_modules` (acting strictly as a dev-environment sprite gallery), `astro-icon` natively tree-shakes this dependency at build time. Only the specifically referenced SVGs are injected into the final bundle, resulting in **zero** client-side overhead. This is verified by ensuring it sits solely in `devDependencies`. There is no need manually copy SVGs.

### 3.9. Verification & Well-known Path

- **Discord Verification:** Stored at `public/.well-known/discord`. Used for ownership verification.

### 3.10. OG Image Generation & Font Strategy

- **Finalized Strategy:** Uses `satori` and `resvg-js`.
- **Fonts:** 
  - Dynamically fetches **Inter** and **Noto Sans JP** (Bold) directly from **Google Fonts GitHub repository** (`raw.githubusercontent.com`) during build time.
  - This ensures direct access to stable TTF files, bypassing complex local font configurations or unstable CDN redirects.
- **Cache:** Images are cached in `node_modules/.cache/og-images` to speed up subsequent builds.

### 3.11. About Page Architecture

- **Structure:** Divided into Experience (Timeline), Tech Stack (Badges), Connect (Social Icons), and Projects.
- **Data Source:** Projects are loaded from the `projects` content collection.
- **SEO Fix:** Ensured proper heading hierarchy (`h1 -> h2 -> h3`) for better accessibility and ranking.

### 3.12. Internationalization (i18n) Routing & Localization
The site architecture achieves full EN/JA bilingual rendering using Astro's static routing and a DRY content setup, completely bypassing middleware for maximum static rendering determinism.
- **Routing Strategy (`[...lang]`):** The entire site is rendered from a single set of dynamic routes inside `src/pages/[...lang]/`. The `getStaticPaths` function maps `lang: undefined` to the Japanese root (`/`) and `lang: 'en'` to the English subdirectory (`/en/`). This guarantees 100% DRY code without needing duplicate wrappers like `/en/index.astro`.
- **Content Strategy (`.en.mdx` suffix):** Translated posts live identically alongside the primary language posts in `src/content/`. English files are suffixed with `.en.mdx` and set `lang: 'en'` in their frontmatter. This strictly preserves file-based navigation (Subpost series) and shared asset relative paths.
- **URL Normalization:** Astro 5's `glob` loader automatically sluggifies dual-extension filenames (e.g., `index.en.mdx` becomes `indexen`), which broke `isSubpost` logic. To solve this, `src/lib/content/posts.ts` globally intercepts and normalizes the `.id` field of translated posts at load-time (using `replace(/\.?en$/, '')` and stripping `/index`). This guarantees 100% ID parity across languages (e.g. `/blog/neural-network` and `/en/blog/neural-network`) without altering component logic.
- **UI Localization:** Language-agnostic strings are offloaded from static markup to `src/i18n/ui.ts` via dict lookups driven by localized paths inferred via `getLangFromUrl` (`src/i18n/utils.ts`).

### 3.13. Home Page: Glass Dashboard → Graph Scroll Experience

The home page (`src/components/pages/Home.astro`) implements a "Glass Dashboard to Fullscreen Graph" concept.

- **Architecture:** A fixed `#graph-wrapper` sits at `z-0` behind a scrollable `<main id="dashboard-content">` at `z-10`. The dashboard is a full-width frosted glass pane (`bg-background/60 backdrop-blur-md`) with rounded bottom corners, containing Hero, Activity Log, and Latest Writings.
- **Scroll-Driven Transition:** The user scrolls naturally past the glass content. A spacer `div` (`h-[100vh]`) after the content guarantees the page is always scrollable. When scrolled to the bottom, JS toggles `pointer-events` — disabling the dashboard and enabling the graph for full interaction.
- **Graph Rotation:** A custom D3 force (`forceRotate`) applies a tangential velocity to each node for a gentle counter-clockwise orbit while the graph is in background mode. The rotation strength is smoothly interpolated (`lerp` at 2%/tick) for gradual start/stop. A `MutationObserver` on the wrapper's `style` attribute detects when `pointer-events` changes to toggle rotation.
- **Exit Button:** A fixed "Back to Content" button appears when the graph is interactive; clicking it scrolls to the top, naturally restoring the dashboard.
- **Mobile Responsiveness:** Tighter spacing (`px-3 pt-8 gap-4`), smaller avatar (`h-20 w-20`), and CSS `scale` transforms on the Activity Graph (`scale-[0.55]` mobile, `scale-75` tablet) ensure a comfortable fit on all screen sizes.

## 4. Development Standards & Conventions

### 4.1. The "Vibe Loop"

1.  Plan -> Code (`pnpm dev`) -> Verify (`lint`, `check:links`) -> Test (`vitest`) -> Build (`pnpm build`).

### 4.2. File Naming & Environment

- **Filenames:** Kebab-case for EVERYTHING without exception (e.g., `binary-search.mdx`, `scc-scs.png`, `graph-view.tsx`). All legacy Japanese filenames have been migrated to English kebab-case.
- **Line Endings:** Force **LF** via `.gitattributes`.
- **Link Integrity:** Internal links must be resolvable. Run `pnpm check:links` before committing.

### 4.3. Markdown Enhancements

- **Anchors:** Automatically generated for H2-H6 via `rehype-autolink-headings`, facilitating direct section linking.
- **Math:** LaTeX support enabled via `remark-math` and `rehype-katex`.

## 5. Configuration Reference

### `astro.config.ts` Highlights
- **Integration**: React, MDX, Tailwind, Expressive Code.
- **Markdown**: Uses `rehype-pretty-code` for syntax highlighting and `remark-math` for LaTeX.

## 6. Status & Future Roadmap

### Completed Milestones
- [x] **Brand Identity:** Fully migrated from `astro-erudite` to `romophic.com`.
- [x] **GraphView UX:** Implemented a high-performance, stylish Knowledge Graph using `d3-force` + Canvas (Glassmorphism, Particle Flow, Manual Hit-testing).
- [x] **Architecture:** Refactored component structure (`layout`, `blog`, `features`, `common`) and centralized script management (`AppScript`).
- [x] **Stability:** Solved View Transitions issues, fixed image double-rendering, and enforced strict file naming conventions.
- [x] **Type Safety:** Eliminated `any` in core logic and centralized type definitions.
- [x] **Modern Images:** Restored and perfected LQIP placeholders using CSS Grid.
- [x] **Robust OG Images:** Implemented a stable font loading strategy for build-time OG image generation.
- [x] **Personal Identity:** Revamped the About page with structured Experience, Skills, and Connect sections.
- [x] **Refined UX:** Improved search interaction (no flicker) and theme transitions (smooth cross-fade).
- [x] **Lighthouse Polish:** Fixed PWA manifest paths, standardized robots.txt, and optimized heading hierarchy.
- [x] **Refactoring (Round 2):** Icon unification (`ICONS` constant), Graph performance optimization (O(1) neighbor check), and strict type improvements.
- [x] **Transition UX:** Implemented "Snappy" page transitions (immediate fade-out using `before-preparation`).
- [x] **Graph View:** Added tag node navigation and addressed resize/skeleton issues.
- [x] **Config:** Standardized Expressive Code style (removed terminal frame for shell).
- [x] **Content:** Added "Neural Network from Scratch" article.
- [x] **Simplification:** Removed PWA features to reduce complexity and resolve caching issues (mobile loading bar).
- [x] **React & Shadcn Execution:** Completely purged `React`, `@fontsource`, `@floating-ui/react`, `@radix-ui`, `cmdk`, and Shadcn from the repository in Phase 3 & Phase 4. Refactored interactive components like `GraphView` directly into Native Astro `<script>` rendering. Clean bill of health via `knip` static analysis.
- [x] **SEO Perfection:** Globally fixed canonical URLs to self-reference properly, injected localized bilingual `hreflang` tags across all documents, and unblocked Subpost indexing by removing legacy `noindex` directives.
- [x] **UI Polish & Minimalism (Home Page Remaster):** Radically simplified `Hero.astro` to feature a minimalist avatar and about link. Re-architected `Home.astro` to utilize a vertical layout emphasizing the Knowledge Graph. Refined Experience timelines (thinned, high-contrast borders) and tightened MDX image captions.
- [x] **Glass Dashboard → Graph Scroll Experience:** Implemented a full-width frosted glass dashboard that naturally scrolls away to reveal a fullscreen interactive Knowledge Graph. Added a custom rotational D3 force for ambient animation, scroll-driven `pointer-events` toggling, and responsive mobile layout with CSS `scale` transforms on the Activity Graph.
- [x] **Bilingual i18n Translation:** Fully completed manual LLM-driven English translations for all 38 remaining `.en.mdx` files (including the entirety of `romophic-library`). Removed all messy temporary automated scripts to ensure authentic, grammatically natural nuance in technical code explanations.
- [x] **SEO Audit & Excellence:** Verified that the site's metadata perfectly satisfies modern search engine requirements. Validated dynamic canonical URL assignments (`rel="canonical"`), precise international targeting (`hreflang` for `ja`, `en`, and `x-default`), correct standard `robots.txt`, and rich JSON-LD snippet generation across all articles.
- [x] **KISS Refactoring (Astro 6):** Upgraded to Astro 6, implementing Native CSP. Removed redundant CLI tools (prompts, tsx) to enforce purely manual, simple Markdown authoring. Extracted reading-time calculations completely from the remark AST pipeline. Evaluated replacing D3.js but rejected it as "reinventing the wheel" to maintain a pragmatic KISS balance.

### Future Features
- [ ] **Performance (Fonts):** Implement font subsetting for Japanese characters to reduce font file size.
- [ ] Content: Complete algorithms library placeholders (`//TODO`).

## 7. Philosophical Notes & Guiding Principles

### Why we refactored everything
This project started as a template (`astro-erudite`), but templates are cages. To achieve a truly unique and "God-Tier" user experience, we had to break free.
- **Identity over Convenience:** We stripped away the generic branding to forge `romophic.com`.
- **Control over Abstraction:** We abandoned `react-force-graph` not because it was bad, but because it was a black box. By rewriting the GraphView with `d3-force` and raw Canvas, we regained total control over physics, rendering, and interaction. The result is a graph that feels alive, not just a static chart.

### Core Principles

1.  **God-Tier UX First:**
    - Never compromise on the user experience. If a library limits our ability to deliver a smooth, intuitive, and beautiful interface (like the graph click detection issues), we rewrite it.
    - Performance is a feature. The site must be fast, responsive, and visually stable (LQIP).

2.  **Radical Ownership:**
    - Understand your tools. Don't just paste code; own it. The transition to a custom D3 implementation exemplifies this. We trade easy implementation for limitless potential and maintainability.

3.  **Minimalism & Robustness:**
    - Complexity is the enemy. We centralized scripts into `AppScript`, unified types in `types.ts`, and enforced strict naming conventions.
    - A clean codebase is a maintainable codebase. We prefer standard web APIs (Canvas, ResizeObserver) and robust logic over fragile hacks.

### A Note to Future Developers
This codebase is now a living organism. It breathes through the D3 simulation and speaks through the content. Treat it with care.
- **Respect the Vibe:** Keep the aesthetics sharp and the interactions snappy.
- **Keep it Clean:** Don't let technical debt accumulate. Refactor fearlessly when the architecture no longer serves the goal.
- **Push the Boundaries:** This is a digital garden. Let it grow wild, but keep the fences strong.

---

_Context Updated: 2026-03-02 (Bilingual i18n Translation & SEO Audit)_
