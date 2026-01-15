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
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Content:** MDX
- **Search:** [Pagefind](https://pagefind.app/) (Static search index)
- **Visualization:** `d3-force` + HTML5 Canvas (Custom implementation).
- **PWA:** `@vite-pwa/astro` (Offline support).

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
    - `AppScript.astro`: **Crucial.** Central manager for theme and scripts across transitions.
    - `AuthorCard.astro`: Profile display for authors.
    - `Callout.astro`: Styled notice blocks for MDX.
    - `CopyCodeManager.astro`: Adds copy buttons to code blocks.
    - `Hero.astro`: The personal introduction section on the homepage.
    - `MDXImage.astro`: Optimized image component for MDX content.
    - `ScrollProgress.astro`: Reading progress bar.
- **`features/`**: Complex interactive islands.
    - `GraphView.tsx`: The Knowledge Graph implementation (D3 + Canvas).
    - `CommandMenu.tsx`: Global search and navigation menu (React).
    - `GlobalLinkPreviews.tsx`: Hover preview for internal links (React).
    - `ActivityGraph.astro`: GitHub-style contribution heatmap.
    - `GiscusComments.astro`: Comment system integration.
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
    - `posts.ts`: Post loading, sorting, and sibling resolution (Subposts).
    - `links.ts`: Backlink indexing and resolution (O(N) inverted index).
    - `authors.ts`: Author data resolution.
    - `toc.ts`: Server-side TOC data generation.
- `data-utils.ts`: **Central Orchestrator.** Aggregates all data for a page (`getPostPageData`).
- `toc.ts`: Client-side Scroll Spy controller (rAF optimized).
- `utils.ts`: General helpers (formatting, word counts).

#### `src/pages/` (Routes)
- `blog/[...id].astro`: Dynamic catch-all for every blog post.
- `blog/[...page].astro`: Paginated list of blog posts.
- `graph.astro`: The Knowledge Graph page.
- `graph.json.ts`: API serving nodes and links for the graph.
- `og/[...slug].png.ts`: Dynamic OG Image generator (Satori + Resvg).
- `rss.xml.ts`, `robots.txt.ts`, `llms.txt.ts`: Meta-feeds.

## 3. Deep Dive: Implementation Details

### 3.1. Content Orchestration (`src/lib/data-utils.ts`)
The `getPostPageData` function is the single entry point for all post metadata. It runs several async tasks in parallel to minimize build time:
- Resolves author information.
- Finds adjacent posts (Next/Prev) within the correct hierarchy (Top-level or Subpost).
- Calculates reading time (combined reading time for parent posts).
- Retrieves backlinks and generates TOC sections.

### 3.2. Knowledge Graph (`src/components/features/GraphView.tsx`)
- **Engine**: Custom D3-force simulation.
- **Rendering**: HTML5 Canvas for $O(1)$ draw performance regardless of node count.
- **Interaction**: Manual hit-testing via coordinate inversion. This ensures precise clicks/hovers even after zoom and pan.
- **Visuals**: Features animated particle flow, dynamic glow effects, and responsive LOD (Level of Detail) for labels.

### 3.3. Script Lifecycle (`src/components/common/AppScript.astro`)
Manages all client-side logic that must survive or re-initialize during `ClientRouter` transitions:
- Persistent Theme (stored in `localStorage`).
- Giscus theme synchronization.
- Event listener attachment for theme toggles and custom components.

## 4. Development Standards & Conventions

### 4.1. The "Vibe Loop"
Plan -> Code (`pnpm dev`) -> Verify (`lint`, `check:links`) -> Test (`vitest`) -> Build (`pnpm build`).

### 4.2. Strict Naming & Environment
- **Filenames**: Kebab-case for EVERYTHING.
- **Line Endings**: LF forced via `.gitattributes`.
- **Imports**: Prefer `@/` alias for all internal modules.

## 5. Status & Future Roadmap

- [x] **Stable Architecture**: Centralized scripts, structured components, O(N) backlinks.
- [x] **High UX Graph**: Custom D3+Canvas implementation with arrow links and glow effects.
- [ ] **Content**: Fill algorithm placeholders in `romophic-library` (`//TODO`).
- [ ] **i18n**: Multi-language support planned.

---

_Context Updated: 2025-12-31 (Full Codebase Map Completed)_