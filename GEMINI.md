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
  - **Core Architecture:** `d3-force` + `d3-zoom` + `d3-drag` driving a raw HTML5 Canvas.
  - **Custom Interaction:** Manual hit-testing and coordinate transformation for 100% reliability.
- **PWA:** `@vite-pwa/astro` (Offline support, installable).

### Directory Structure & Key Files

```text
root/
├── astro.config.ts          # Core Astro config (Integrations: MDX, React, PWA, Tailwind)
├── package.json             # Scripts & Dependencies
├── src/
│   ├── components/
│   │   ├── blog/            # Blog-specific UI components
│   │   │   ├── Backlinks.astro      # Lists posts linking to the current post
│   │   │   ├── BlogCard.astro       # Preview card for post lists
│   │   │   ├── PostHeader.astro     # Title, date, tags, reading time
│   │   │   ├── PostNavigation.astro # Next/Prev post links
│   │   │   ├── SubpostsSidebar.astro# Sidebar for nested post series
│   │   │   └── TOCSidebar.astro     # Table of Contents sidebar
│   │   ├── common/          # Reusable, domain-agnostic components
│   │   │   ├── AppScript.astro      # Global client-side logic (Theme, Giscus) via astro:page-load
│   │   │   ├── AuthorCard.astro     # Author profile display
│   │   │   ├── Callout.astro        # Alert/Info boxes for MDX
│   │   │   ├── Hero.astro           # Homepage introduction section
│   │   │   ├── Link.astro           # Wrapper for <a> with prefetching
│   │   │   └── MDXImage.astro       # Server-side image optimization wrapper
│   │   ├── features/        # Complex, interactive feature components
│   │   │   ├── ActivityGraph.astro  # GitHub-style contribution heatmap
│   │   │   ├── CommandMenu.tsx      # Cmd+K search modal (React)
│   │   │   ├── GiscusComments.astro # Comments widget container
│   │   │   ├── GlobalLinkPreviews.tsx # Internal link hover previews (React)
│   │   │   └── GraphView.tsx        # D3+Canvas Knowledge Graph (React)
│   │   ├── layout/          # Site structure components
│   │   │   ├── Footer.astro         # Site footer
│   │   │   ├── Head.astro           # <head> meta tags and resource links
│   │   │   ├── Header.astro         # Top navigation bar
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
│   │   │   ├── posts.ts     # Post loading, sorting, adjacency (Memoized)
│   │   │   ├── links.ts     # Backlink extraction & resolution (O(N))
│   │   │   └── toc.ts       # Server-side TOC data generation
│   │   ├── data-utils.ts    # Main entry point for page data aggregation
│   │   └── toc.ts           # Client-side Scroll Spy controller
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

The entire site revolves around the `blog` content collection. The rendering pipeline is as follows:

1.  **Loading (`src/content.config.ts`):**
    - Uses `glob` loader to ingest files from `src/content/blog`.
    - **Schema:** `title`, `description`, `date`, `order`, `image`, `tags`, `authors`, `draft`.
2.  **Route Generation (`src/pages/blog/[...id].astro`):**
    - Generates routes for _every_ MDX file, preserving the file path as the ID.
3.  **Data Aggregation (`getPostPageData`):**
    - Orchestrates parallel fetching of authors, navigation, reading time, backlinks, and TOC.
4.  **Rendering:**
    - `Astro.render()` compiles MDX to HTML. Islands (`GraphView`, `CommandMenu`) are hydrated on the client.

### 3.2. Subpost (Book/Series) Logic Specification

Supports multi-level nested hierarchies (e.g., `a/b/c`).

- **Logic Location:** `src/lib/content/posts.ts`
- **Parent Resolution:** `getParentId(id)` returns the immediate parent path (e.g., `a/b/c` -> `a/b`).
- **Navigation:** Restrict `getAdjacentPosts` to siblings sharing the same Parent ID.

### 3.3. Knowledge Graph & Backlinks Engine

- **Backlink Logic (`src/lib/content/links.ts`):**
  - **Method:** Inverted Index Map (`_backlinksMap`).
  - **Complexity:** $O(N)$ cached during build.
- **Visualization (`GraphView.tsx`):**
  - **Implementation:** Pure `d3-force` + Canvas API.
  - **Visuals:**
    - **Particle Flow:** Animated particles moving along links.
    - **Dynamic Glow:** Theme-aware `shadowBlur` effects.
    - **Glassmorphism:** Labels with semi-transparent, blurred backgrounds.
    - **LOD:** Labels hidden/shown based on zoom and node importance (link count).
  - **Interaction:** Manual hit-testing using coordinate inversion ensures perfect responsiveness even in dense clusters.

### 3.4. Search Architecture

- **Engine:** **Pagefind** (Static Search).
- **Integration:** `CommandMenu.tsx` with thematic highlighting (`bg-primary/20`).

### 3.5. Image Optimization Pipeline (LQIP)

1.  **Input:** Local or external images.
2.  **Processing:** `MDXImage.astro` generates 20px WebP placeholders.
3.  **Client-Side (`ZoomableImage.tsx`):**
    - Uses **CSS Grid Stacking** to overlay images.
    - **Note:** Placeholder rendering is currently **disabled** to prevent rendering issues.

### 3.6. Table of Contents

- **Source:** `src/lib/toc.ts`
- **Pattern:** Active Scroll Spy with `requestAnimationFrame` optimization.

### 3.7. Global Script Management (AppScript)

- **Source:** `src/components/common/AppScript.astro`
- **Purpose:** Centralizes theme management and third-party script (Giscus) initialization to survive View Transitions.
- **Pattern:** Uses `astro:page-load` for re-initialization.

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
- [x] **GraphView UX:** High-performance D3+Canvas implementation.
- [x] **Architecture Refactor:** Component categorization and centralised scripts.
- [x] **Brand Refresh:** Migration from template to `romophic.com`.

### Future Features
- [ ] Content: Complete algorithms library placeholders (`//TODO`).
- [ ] UI: Restore Image LQIP (blur placeholders) using CSS Grid.
- [ ] i18n: Multi-language support.

---

_Context Updated: 2025-12-31 (Graph UX & Architecture Refactor Complete)_