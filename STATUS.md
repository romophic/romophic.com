# Project Status & Implementation Details

This document tracks the current state of **romophic.com**, including implemented features, technical details, and known issues. Refer to this file to understand *what* exists and *how* it works.

## ✅ Implemented Features

### 1. Medium-style Image Zoom with LQIP
*   **Description:** Click-to-zoom functionality for images with Low-Quality Image Placeholders (LQIP) for perceived performance.
*   **Tech Stack:** `react-medium-image-zoom`, Astro `getImage` API.
*   **Implementation:**
    *   `src/components/MDXImage.astro`: Generates a tiny (20px) WebP placeholder at build time.
    *   `src/components/ui/ZoomableImage.tsx`: Handles the zoom interaction and the smooth cross-fade between the blurred placeholder and the high-res image once loaded.
    *   **Fixes:** Resolved race conditions where cached images caused double-rendering by checking `img.complete` and using CSS opacity transitions.

### 2. Bi-directional Links (Backlinks)
*   **Description:** Automatically lists posts that link to the current post.
*   **Tech Stack:** Server-side regex parsing (`src/lib/data-utils.ts`).
*   **Implementation:**
    *   `getBacklinks`: Scans all MDX content for `[...](url)` patterns.
    *   Resolves relative paths (`../foo`) and absolute paths to match Astro's content collection IDs.
    *   Renders via `src/components/Backlinks.astro`.

### 3. Interactive Graph View
*   **Description:** 2D force-directed graph visualizing connections between posts and tags.
*   **Tech Stack:** `react-force-graph-2d`.
*   **Implementation:**
    *   `src/pages/graph.json.ts`: Generates the node/link data.
    *   `src/components/GraphView.tsx`: Renders the graph. Automatically adapts colors to Dark/Light mode using `MutationObserver` on the `html` element.
    *   **Optimization:** Loaded via `client:only="react"` to avoid SSR issues with canvas.

### 4. CLI Scaffolding Tool
*   **Description:** Interactive CLI to create new posts.
*   **Usage:** `pnpm new-post`
*   **Implementation:** `scripts/new-post.ts` using `prompts` and `node:fs`. Handles folder creation, slug generation, and frontmatter templating.

### 5. AI & SEO Optimization
*   **llms.txt:** Generates `/llms.txt` via `src/pages/llms.txt.ts`. Provides a Markdown summary of the site structure and recent posts for AI agents.
*   **robots.txt:** Dynamically generated via `src/pages/robots.txt.ts`.
*   **PWA:** Offline support configured via `@vite-pwa/astro` (cached on install).

### 6. UX Enhancements
*   **Command Menu (Cmd+K):** `cmdk` based global navigation.
*   **Link Previews:** Hover cards for internal links using `@floating-ui/react`.
*   **Prefetching:** Astro's prefetch enabled with `defaultStrategy: 'hover'` to balance speed and bandwidth.

### 7. Search & Discovery
*   **Enhanced Pagefind UI:**
    *   **Description:** Improved search experience with better result highlighting and snippets, integrated deeply into the Command Menu.
    *   **Implementation:** `src/components/CommandMenu.tsx` uses Pagefind with `sub_results` enabled for granular matches.

### 8. Internal Link Standardization & File Normalization
*   **Description:** Standardized internal links and filenames within complex nested content (e.g., `romophic-library`).
*   **Implementation:** 
    *   Renamed files to **kebab-case** (e.g., `DirectedGraph.mdx` -> `directed-graph.mdx`) for URL consistency.
    *   Updated all internal links to match new filenames.
    *   Added `pnpm check:links` script to verify link integrity.

### 9. Code Quality & Testing
*   **Unit Tests:** Added **Vitest** for testing core logic (`src/lib/content`).
*   **Link Checking:** Automated internal link validation script (`scripts/check-links.cjs`).

### 10. Performance Optimization
*   **Graph View:** Implemented `React.lazy` and `Suspense` for `react-force-graph-2d` to reduce initial bundle size.

## 🚧 Known Issues & Technical Debt

*   **Linting:** `cmdk-input-wrapper` attribute in `command.tsx` triggers `react/no-unknown-property`.
    *   *Status:* Suppressed via file-level `eslint-disable`.
*   **PWA Strategy:** Currently requires "Add to Home Screen" for full offline capability. Browser-only caching is standard HTTP cache + runtime SW.

## 🚀 Planned Features (ToDo)

(No pending features currently planned)


