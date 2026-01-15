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

- **Framework:** [Astro v5](https://astro.build/) (SSG, Islands Architecture)
- **UI Library:** [React v19](https://react.dev/) (For interactive islands)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (configured via `@tailwindcss/vite`)
  - **Theme Strategy:** CSS Variables in `src/styles/global.css` (`--background`, `--foreground`, etc.) combined with `oklch` colors.
  - **Fonts:** `Geist` (Sans) and `Geist Mono` (Monospace).
- **Content:** MDX
  - **Remark Plugins:** `remark-math` (Math support), `remark-emoji`.
  - **Rehype Plugins:** `rehype-katex` (Math rendering), `rehype-pretty-code` (Code highlighting), `rehype-external-links`, `rehype-heading-ids`, `rehype-autolink-headings` (Anchor links).
- **Search:** [Pagefind](https://pagefind.app/) (Static search index)
- **Visualization:**
  - **Core Architecture:** `d3-force` + `d3-zoom` + `d3-drag` driving a raw HTML5 Canvas.
  - **Custom Interaction:** Manual hit-testing and coordinate transformation (`screen2GraphCoords`) for 100% reliability.
- **PWA:** `@vite-pwa/astro` (Offline support, installable).

### Directory Structure & Codebase Complete Map

#### `src/components/` (UI Components)
- **`blog/`**: Post-specific UI elements.
    - `Backlinks.astro`: Lists incoming links to the current post.
    - `BlogCard.astro`: Preview card for post lists (used in `/blog` and Home).
    - `PostHeader.astro`: Post metadata (title, date, tags, reading time).
    - `PostNavigation.astro`: Contextual Next/Prev links.
    - `SubpostsHeader.astro`: Navigation for series/books (mobile/top).
    - `SubpostsSidebar.astro`: Navigation for series/books (desktop sidebar).
    - `TOCHeader.astro`: Table of Contents for mobile.
    - `TOCSidebar.astro`: Table of Contents for desktop.
- **`common/`**: Reusable blocks.
    - `AppScript.astro`: **Crucial.** Central manager for theme and scripts across transitions (astro:page-load).
    - `AuthorCard.astro`: Profile display for authors.
    - `Callout.astro`: Styled notice blocks for MDX.
    - `CopyCodeManager.astro`: Adds copy buttons to code blocks.
    - `Favicons.astro`: Favicon link tags.
    - `Hero.astro`: The personal introduction section on the homepage.
    - `Link.astro`: Wrapper for `<a>` tags with prefetching.
    - `MDXImage.astro`: Server-side image optimization wrapper.
    - `ProjectCard.astro`: Portfolio project card.
    - `ScrollProgress.astro`: Reading progress bar.
    - `ScrollToTop.astro`: Scroll to top button.
    - `SocialIcons.astro`: Social media icons.
- **`features/`**: Complex interactive islands.
    - `GraphView.tsx`: The Knowledge Graph implementation (D3 + Canvas).
    - `CommandMenu.tsx`: Global search and navigation menu (React).
    - `GlobalLinkPreviews.tsx`: Hover preview for internal links (React).
    - `ActivityGraph.astro`: GitHub-style contribution heatmap.
    - `GiscusComments.astro`: Comment system integration.
    - `PageLoader.astro`: Page transition loader.
    - `ReloadPrompt.astro`: PWA update prompt.
- **`layout/`**: Structural components.
    - `Header.astro`: Navigation bar.
    - `Footer.astro`: Site footer with social links.
    - `Head.astro`: Global `<head>` contents.
    - `PageHead.astro`: SEO and meta tags per page.
    - `ThemeToggle.astro`: Switch button for dark/light mode.
- **`ui/`**: Atomic, unstyled components (Shadcn-like).
    - `button.tsx`, `dialog.tsx`, `badge.tsx`, `ZoomableImage.tsx`, etc.

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
- `rss.xml.ts`, `robots.txt.ts`, `llms.txt.ts`: Meta-feeds.

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
    - **Islands:** Interactive components (`CommandMenu`, `GraphView`, `GiscusComments`) are hydrated on the client.

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
  - **Efficiency:** The engine scans all posts **once** ($O(N)$) to build a global map of `TargetID -> SourcePosts[]`. This map is cached and reused, replacing the inefficient $O(N^2)$ scan.
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

- **Search Engine:** **Pagefind** (Static Search) indexed post-build.
- **Integration:** `CommandMenu.tsx` with thematic highlighting (`bg-primary/20`).
- **Link Previews (`GlobalLinkPreviews.tsx`):**
  - Client-side component that intercepts hover events on internal links.
  - Fetches and parses target HTML metadata.
  - **Fix:** Resolves relative `og:image` paths to absolute URLs to prevent 404s.

### 3.5. Image Optimization Pipeline (LQIP)

1.  **Input:** Local images in `src/content/...` or external URLs.
2.  **Processing (`MDXImage.astro`):**
    - Calls `getImage()` (Astro Assets) to generate a **20px wide, 50% quality WebP** version of the image. This serves as the "BlurHash" style placeholder.
3.  **Client-Side (`ZoomableImage.tsx`):**
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

### 3.8. Icon System

- **Source:** `public/icon.webp`.
- **Generation:** `scripts/generate-icons.ts` creates all PNG/ICO variants.

### 3.9. Type & Constant Centralization

- **Types:** All major domain models (`PostPageData`, `AdjacentPosts`, `D3GraphNode`, etc.) are centralized in `src/types.ts`.
- **Constants:** Site-wide configuration, including Giscus, OpenGraph dimensions, and GraphView physics/themes, are consolidated in `src/consts.ts` for easier maintenance.

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
- **Integration**: React, MDX, PWA, Tailwind, Expressive Code.
- **PWA**: Configured for `romophic.com`.
- **Markdown**: Uses `rehype-pretty-code` for syntax highlighting and `remark-math` for LaTeX.

## 6. Status & Future Roadmap

### Completed Milestones
- [x] **Brand Identity:** Fully migrated from `astro-erudite` to `romophic.com`.
- [x] **GraphView UX:** Implemented a high-performance, stylish Knowledge Graph using `d3-force` + Canvas (Glassmorphism, Particle Flow, Manual Hit-testing).
- [x] **Architecture:** Refactored component structure (`layout`, `blog`, `features`, `common`) and centralized script management (`AppScript`).
- [x] **Stability:** Solved View Transitions issues, fixed image double-rendering, and enforced strict file naming conventions.
- [x] **Type Safety:** Eliminated `any` in core logic and centralized type definitions.
- [x] **Modern Images:** Restored and perfected LQIP placeholders using CSS Grid.

### Future Features
- [ ] Content: Complete algorithms library placeholders (`//TODO`).
- [ ] i18n: Multi-language support.

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

_Context Updated: 2025-12-31 (Strict Typing & Final UX Polish Completed)_
