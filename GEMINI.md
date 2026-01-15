# GEMINI Project Context

## 0. Meta-Instruction: Maintaining This Document

**This file is a living document.** It serves as the primary context anchor for this project.

- **Read First:** Before starting any task, read this file to understand the current architecture and conventions.
- **Update Always:** Whenever you change the project structure, add new features, modify core logic, or establish new patterns, **you MUST update this file**.
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
  - **Rehype Plugins:** `rehype-katex` (Math rendering), `rehype-pretty-code` (Code highlighting), `rehype-external-links`, `rehype-heading-ids`.
- **Search:** [Pagefind](https://pagefind.app/) (Static search index)
- **Visualization:**
  - **Core:** `d3-force`, `d3-zoom`, `d3-drag` (Custom Canvas Implementation).
  - **Interaction:** Manual hit-testing via coordinate transformation.
  - **Components:** `react-medium-image-zoom` (Image interaction).
- **PWA:** `@vite-pwa/astro` (Offline support, installable).

### Directory Structure & Key Files

```text
root/
├── astro.config.ts          # Core Astro config (Integrations, Markdown, PWA)
├── package.json             # Scripts & Dependencies
├── src/
│   ├── components/
│   │   ├── blog/            # Blog-specific UI components
│   │   │   ├── Backlinks.astro      # Lists posts linking to the current post
│   │   │   ├── BlogCard.astro       # Preview card for post lists
│   │   │   ├── PostHeader.astro     # Title, date, tags, reading time
│   │   │   ├── PostNavigation.astro # Next/Prev post links
│   │   │   ├── SubpostsHeader.astro # Sidebar for nested post series
│   │   │   ├── SubpostsSidebar.astro# Sidebar for nested post series
│   │   │   ├── TOCHeader.astro      # Table of Contents header
│   │   │   └── TOCSidebar.astro     # Table of Contents sidebar
│   │   ├── common/          # Reusable, domain-agnostic components
│   │   │   ├── AppScript.astro      # Global client-side logic (Theme, Giscus) via astro:page-load
│   │   │   ├── AuthorCard.astro     # Author profile display
│   │   │   ├── Callout.astro        # Alert/Info boxes for MDX
│   │   │   ├── CopyCodeManager.astro# Code block copy functionality
│   │   │   ├── Favicons.astro       # Favicon link tags
│   │   │   ├── Hero.astro           # Homepage introduction section
│   │   │   ├── Link.astro           # Wrapper for <a> with prefetching
│   │   │   ├── MDXImage.astro       # Server-side image optimization wrapper
│   │   │   ├── ProjectCard.astro    # Project portfolio card
│   │   │   ├── ScrollProgress.astro # Scroll progress bar
│   │   │   ├── ScrollToTop.astro    # Scroll to top button
│   │   │   └── SocialIcons.astro    # Social media icons
│   │   ├── features/        # Complex, interactive feature components
│   │   │   ├── ActivityGraph.astro  # GitHub-style contribution heatmap
│   │   │   ├── CommandMenu.tsx      # Cmd+K search modal (React)
│   │   │   ├── GiscusComments.astro # Comments widget container
│   │   │   ├── GlobalLinkPreviews.tsx # Internal link hover previews (React)
│   │   │   ├── GraphView.tsx        # D3+Canvas Knowledge Graph (React)
│   │   │   ├── PageLoader.astro     # Page transition loader
│   │   │   └── ReloadPrompt.astro   # PWA update prompt
│   │   ├── layout/          # Site structure components
│   │   │   ├── Breadcrumbs.astro    # Breadcrumb navigation
│   │   │   ├── Footer.astro         # Site footer
│   │   │   ├── Head.astro           # <head> meta tags and resource links
│   │   │   ├── Header.astro         # Top navigation bar
│   │   │   ├── PageHead.astro       # Page-specific meta tags
│   │   │   └── ThemeToggle.astro    # Dark/Light mode switch button
│   │   └── ui/              # Atomic UI components (Shadcn-like)
│   │       ├── button.tsx, dialog.tsx, zoomable-image.tsx ...
│   ├── content/             # Content Collections (Data Source)
│   │   ├── authors/         # Author metadata (.md)
│   │   ├── blog/            # Blog posts (.mdx), supports nested folders
│   │   └── projects/        # Portfolio projects (.md)
│   ├── layouts/
│   │   └── Layout.astro     # Master layout (<html>, <body>, providers)
│   ├── lib/
│   │   ├── content/         # Data fetching logic
│   │   │   ├── authors.ts   # Author data processing
│   │   │   ├── links.ts     # Backlink extraction & resolution (O(N))
│   │   │   ├── posts.ts     # Post loading, sorting, adjacency (Memoized)
│   │   │   └── toc.ts       # Server-side TOC data generation
│   │   ├── data-utils.ts    # Main entry point for page data aggregation
│   │   ├── toc.ts           # Client-side Scroll Spy controller
│   │   └── utils.ts         # Helpers (cn, date, word count)
│   ├── pages/
│   │   ├── blog/[...id].astro # Dynamic route for individual blog posts
│   │   ├── graph.astro        # Knowledge Graph page
│   │   ├── graph.json.ts      # API endpoint serving graph data
│   │   ├── index.astro        # Homepage
│   │   ├── rss.xml.ts         # RSS Feed generator
│   │   └── og/[...slug].png.ts # Dynamic Open Graph image generator
│   └── styles/
│       ├── global.css       # Global styles & Tailwind variables
│       └── typography.css   # Prose styling configuration
```

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

### 3.3. Knowledge Graph & Backlinks Engine

The project features a bi-directional linking system and a visualization graph.

- **Backlink Logic (`src/lib/content/links.ts`):**
  - **Method:** Inverted Index Map (`_backlinksMap`).
  - **Pattern:** `/\[.*?\]\((.*?)\)/g` (Standard Markdown links).
  - **Efficiency:** The engine scans all posts **once** ($O(N)$) to build a global map of `TargetID -> SourcePosts[]`. This map is cached and reused, replacing the inefficient $O(N^2)$ scan.
  - **Resolution:** Handles absolute (`/blog/foo`) and relative (`../foo`) paths, normalizing IDs (removing `/index`).

- **Graph Visualization (`src/components/features/GraphView.tsx`):**
  - **Architecture:** `d3-force` simulation driving a raw HTML5 Canvas. No external React graph libraries are used to ensure maximum control.
  - **Rendering:** Custom `requestAnimationFrame` loop.
  - **Interaction (Manual Hit-Testing):**
    - Instead of relying on the library's hit detection (which can be flaky with custom drawing), we implement a manual check using `transformRef.current.invertX/Y`.
    - On click/hover, the mouse coordinates are transformed into graph space, and the Euclidean distance to every node is calculated to find the nearest target.
  - **Visuals:** Particle flow on links, theme-aware glow effects (`shadowBlur`), and glassmorphism labels.

### 3.4. Search & Link Previews

- **Search Engine:** **Pagefind** (Static Search) indexed post-build.
- **Link Previews (`src/components/features/GlobalLinkPreviews.tsx`):**
  - Client-side component that intercepts hover events on internal links.
  - Fetches the target URL in the background, parses the HTML (`DOMParser`), and extracts metadata (`og:image`, title, description) to display a floating preview card.
  - **Optimization:** Caches fetched metadata to prevent redundant network requests.

### 3.5. Image Optimization Pipeline (LQIP)

1.  **Input:** Local images in `src/content/...` or external URLs.
2.  **Processing (`MDXImage.astro`):**
    - Calls `getImage()` (Astro Assets) to generate a **20px wide, 50% quality WebP** version of the image.
3.  **Client-Side (`ZoomableImage.tsx`):**
    - **Note:** Placeholder rendering is currently **disabled** via comment to prevent layout issues.
    - Uses **CSS Grid Stacking** (`grid-area: 1/1`) to overlap images without absolute positioning issues.
    - Uses `react-medium-image-zoom` for the zoom interaction.

### 3.6. Table of Contents (Client-Side Logic)

- **Source:** `src/lib/toc.ts`
- **Pattern:** Active Scroll Spy with `requestAnimationFrame` optimization.
- **Performance:** Throttled scroll handling to prevent layout thrashing.

### 3.7. Global Script Management (AppScript)

- **Source:** `src/components/common/AppScript.astro`
- **Purpose:** Centralizes all global client-side logic (Theme management, Giscus configuration, etc.) to ensure reliable execution across page transitions.
- **Lifecycle Management:**
  - Uses `astro:page-load` event listener to re-initialize scripts after View Transitions.
  - Eliminates the need for scattered `is:inline` scripts, ensuring a predictable execution order.

### 3.8. Icon System

- **Source:** `public/icon.webp`.
- **Generation:** `scripts/generate-icons.ts` creates all PNG/ICO variants.

## 4. Development Standards & Conventions

### 4.1. The "Vibe Loop"

1.  Plan -> Code (`pnpm dev`) -> Verify (`lint`, `check:links`) -> Test (`vitest`) -> Build (`pnpm build`).

### 4.2. File Naming & Environment

- **Filenames:** Kebab-case for EVERYTHING (no exceptions).
- **Line Endings:** Force **LF** via `.gitattributes`.
- **Link Integrity:** Run `pnpm check:links` before commit.

## 5. Configuration Reference

### `astro.config.ts`
- PWA configured for `romophic.com`.
- Markdown uses `rehype-pretty-code` and `remark-math`.

## 6. Status & Future Roadmap

### Completed Milestones
- [x] **Brand Identity:** Fully migrated from `astro-erudite` to `romophic.com`.
- [x] **GraphView UX:** Implemented a high-performance, stylish Knowledge Graph using `d3-force` + Canvas (Glassmorphism, Particle Flow, Manual Hit-testing).
- [x] **Architecture:** Refactored component structure (`layout`, `blog`, `features`, `common`) and centralized script management (`AppScript`).
- [x] **Stability:** Solved View Transitions issues, fixed image double-rendering, and enforced strict file naming conventions.

### Future Features
- [ ] Content: Complete algorithms library placeholders (`//TODO`).
- [ ] UI: Restore Image LQIP (blur placeholders) using CSS Grid.
- [ ] i18n: Multi-language support.

---

_Context Updated: 2025-12-31 (Graph UX & Architecture Refactor Complete)_
