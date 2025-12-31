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
  - `react-force-graph-2d` (Knowledge Graph).
  - `react-medium-image-zoom` (Image interaction).
- **PWA:** `@vite-pwa/astro` (Offline support, installable).

### Directory Structure & Key Files

```text
root/
├── astro.config.ts          # Core Astro config (Integrations, Markdown, PWA)
├── package.json             # Scripts & Dependencies
├── src/
│   ├── components/
│   │   ├── ui/              # Atomic Design Components (Shadcn-like)
│   │   │   ├── button.tsx, dialog.tsx, command.tsx ...
│   │   ├── CommandMenu.tsx  # Global Cmd+K Search & Nav
│   │   ├── GraphView.tsx    # Interactive Force Graph
│   │   ├── GlobalLinkPreviews.tsx # Hover cards for links
│   │   ├── MDXImage.astro   # Astro wrapper for ZoomableImage
│   │   └── ...              # Domain components (Header, Footer, PostHead)
│   ├── content/             # Content Collections (Single Source of Truth)
│   │   ├── blog/            # MDX Posts (supports nested folders like 'romophic-library')
│   │   ├── authors/         # Author metadata
│   │   └── projects/        # Project portfolio
│   ├── layouts/
│   │   └── Layout.astro     # Root layout (Html, Head, Global Providers)
│   ├── lib/
│   │   ├── content/         # Atomic data fetchers
│   │   │   ├── posts.ts     # Post parsing, adjacency, subposts
│   │   │   ├── links.ts     # Backlink regex parsing & resolution
│   │   │   └── toc.ts       # Server-side TOC generation
│   │   ├── data-utils.ts    # Unified Data Aggregator (getPostPageData)
│   │   ├── toc.ts           # Client-side TOC Scroll Spy Controller
│   │   └── utils.ts         # Helpers (cn, date, word count)
│   ├── pages/
│   │   ├── blog/[...id].astro # Catch-all route for ALL blog posts
│   │   ├── graph.json.ts    # JSON endpoint for GraphView data
│   │   └── ...              # RSS, Robots, Sitemap
│   └── styles/
│       ├── global.css       # CSS Variables & Tailwind Theme
│       └── typography.css   # Prose styling
```

## 3. Deep Dive: Architecture & Implementation Details

### 3.1. Content Data Flow & Rendering Pipeline

The entire site revolves around the `blog` content collection. The rendering pipeline is as follows:

1.  **Loading (`src/content.config.ts`):**
    - Uses `glob` loader to ingest files from `src/content/blog`.
    - **Schema:** `title`, `description`, `date`, `order` (optional), `image` (optional), `tags`, `authors`, `draft`.
2.  **Route Generation (`src/pages/blog/[...id].astro`):**
    - `getStaticPaths` calls `getAllPostsAndSubposts` (from `src/lib/data-utils.ts`).
    - It generates routes for _every_ MDX file, preserving the file path as the ID.
3.  **Data Aggregation (`getPostPageData`):**
    - When a page is built, `getPostPageData` runs. It orchestrates multiple parallel promises:
      - `parseAuthors`: Resolves author IDs to author data.
      - `getAdjacentPosts`: Determines Next/Prev links based on the post's hierarchy (Top-level vs. Subpost).
      - `hasSubposts` / `getSubpostCount`: Checks for children.
      - `getPostReadingTime`: Calculates reading time based on word count (HTML strip).
      - `getBacklinks`: Scans for incoming links.
4.  **Rendering:**
    - `Astro.render()` compiles the MDX to HTML.
    - **Components:** Custom components (like `MDXImage`) are passed to the MDX renderer.
    - **Islands:** Interactive components (`CommandMenu`, `GraphView`, `GiscusComments`) are hydrated on the client.

### 3.2. Subpost (Book/Series) Logic Specification

The project implements a custom "Subpost" pattern to support book-like content (e.g., `romophic-library`).

- **Logic Location:** `src/lib/content/posts.ts`
- **Definition:** A post is considered a "Subpost" if its ID contains a forward slash (`/`).
  - `isSubpost(id)`: `id.includes('/')`
- **Parent Resolution:**
  - `getParentId(id)`: Returns `id.split('/')[0]`.
  - **Constraint:** This logic assumes a flat 2-level hierarchy (Root -> Child). Deeply nested paths (Root -> Child -> Grandchild) will currently map to the _Root_ as the parent, not the immediate predecessor.
- **Navigation (`getAdjacentPosts`):**
  - **Subposts:** Navigation is restricted to siblings sharing the same Parent ID. Sorted by `date` (descending) or `order` (ascending).
  - **Top-level:** Navigation is across all top-level posts.
- **Reading Time:**
  - For Parent posts, `getCombinedReadingTime` aggregates the reading time of the parent _plus_ all its subposts.

### 3.3. Knowledge Graph & Backlinks Engine

The project features a bi-directional linking system and a visualization graph.

- **Backlink Logic (`src/lib/content/links.ts`):**
  - **Method:** Regex Scanning.
  - **Pattern:** `/\[.*?\]\((.*?)\)/g` (Standard Markdown links).
  - **Scope:** Iterates through _every_ post's `body` content to find links pointing to the `targetId`.
  - **Resolution (`resolveLinkToId`):**
    - Handles absolute paths (`/blog/foo`).
    - Handles relative paths (`../foo`, `./foo`) using `path.posix.join` relative to the source file.
    - Normalizes `index` files (treats `foo/index` as `foo`).
  - **Complexity:** $O(N^2)$ (where N is the number of posts). This happens at build time.

- **Graph Generation (`src/pages/graph.json.ts`):**
  - Generates a JSON object `{ nodes: [], links: [] }`.
  - **Nodes:**
    - Type `post`: Value = 2.
    - Type `tag`: Value = 1.
  - **Links:**
    - `Post -> Tag`: Value = 1.
    - `Post -> Post`: Value = 2 (Derived from the same Regex logic as Backlinks).
  - **Client-Side Rendering:** `GraphView.tsx` uses `react-force-graph-2d` to render this JSON. It uses a `MutationObserver` to detect theme changes (`data-theme`) and update node colors dynamically.

### 3.4. Search Architecture

- **Engine:** **Pagefind** (Static Search).
- **Indexing:** Runs post-build (`pagefind --site dist`).
- **Integration:** `CommandMenu.tsx`.
  - Lazy-loads `/pagefind/pagefind.js` when the user types.
  - `options({ showSubResults: true })`: Enables searching specifically for headings within posts, not just whole pages.
  - **UI:** Renders search results with highlighted excerpts using `dangerouslySetInnerHTML`.

### 3.5. Image Optimization Pipeline (LQIP)

1.  **Input:** Local images in `src/content/...` or external URLs.
2.  **Processing (`MDXImage.astro`):**
    - Calls `getImage()` (Astro Assets) to generate a **20px wide, 50% quality WebP** version of the image. This serves as the "BlurHash" style placeholder.
3.  **Client-Side (`ZoomableImage.tsx`):**
    - Renders the tiny placeholder scaled up with `filter: blur(20px)`.
    - Renders the full-resolution image on top, initially `opacity-0`.
    - On `onLoad` of the full image, transitions `opacity` to 1.
    - Uses `react-medium-image-zoom` for the zoom interaction.

### 3.6. Table of Contents (Client-Side Logic)

- **Source:** `src/lib/toc.ts`
- **Pattern:** Active Scroll Spy.
- **Initialization:** `TOCController.init()` called in `Layout` or `TOCSidebar`.
- **Calculations:**
  - `HeadingRegions.build()`: Maps every H2/H3/etc. to a start/end Y-coordinate on the page.
- **Event Loop:**
  - On `scroll`: Calculates which regions are currently in the viewport.
  - Updates the DOM of the Sidebar links (adds `text-foreground` class) to reflect the active section.
  - Handles "Scroll Masking" (fading effect) on the sidebar container itself if it overflows.

## 4. Development Standards & Conventions

### 4.1. The "Vibe Loop"

1.  **Plan:** Check `GEMINI.md` and codebase.

2.  **Code:** `pnpm dev` (Port 1234).

3.  **Verify:** `pnpm lint`, `pnpm prettier`, `pnpm check:links`.

4.  **Test:** `pnpm test` (Vitest) for logic.

5.  **Finalize:** **Run `pnpm build`**. You MUST ensure the build completes without errors (including `astro check` diagnostics) before considering a task finished.



### 4.2. File Naming & Linking

- **Filenames:** Kebab-case (e.g., `directed-graph.mdx`, `graph-view.tsx`).
- **Link Integrity:**
  - Internal links **MUST** be resolvable.
  - Prefer absolute paths (`/blog/my-post`) for robustness, but relative paths are supported by the resolver.
  - **Avoid:** Renaming files without running `pnpm check:links`.

### 4.3. Styling (Tailwind v4)

- **CSS Variables:** The project heavily relies on CSS variables for theming.
  - **DO:** Use `bg-background`, `text-muted-foreground`.
  - **DON'T:** Use hardcoded colors like `bg-white` or `text-gray-500` (breaks dark mode).
- **Utility First:** Use utility classes for layout and spacing.
- **Islands:** Interactive components should isolate their styles or use `clsx`/`tailwind-merge` via the `cn()` utility.

### 4.4. Component Design
*   **Atomic Design:** Reusable UI elements live in `src/components/ui/`.
*   **TypeScript:** **Avoid `any` types.** Always define proper interfaces (e.g., `GraphNode` in `GraphView.tsx`) to ensure type safety.
*   **Astro vs. React:**
  - Use **Astro** for static layout, text, and structure.
  - Use **React** _only_ for stateful interactivity (Search, Graph, Zoom).
  - **Hydration:** Use `client:idle` or `client:visible` to defer JS loading. Use `client:only="react"` for libraries that depend on `window` (like Force Graph).

## 5. Configuration Reference

### `astro.config.ts` Highlights

- `prefetch: { defaultStrategy: 'hover' }`: Smart prefetching.
- `integrations`:
  - `expressiveCode`: Configured with GitHub Light/Dark themes.
  - `mdx`: Standard support.
  - `react`: For islands.
  - `sitemap`: SEO.
  - `AstroPWA`: Offline capabilities.
  - `partytown`: Third-party script offloading.

### `package.json` Scripts

- `new-post`: `tsx scripts/new-post.ts` (CLI for creating content).
- `check:links`: `node scripts/check-links.cjs` (Integrity check).
- `build`: `astro check && astro build && pagefind --site dist`.

---

_Context Generated: 2025-12-31_
