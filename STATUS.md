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

## 🚧 Known Issues & Technical Debt

*   **Deprecated `React.ElementRef`:** Build logs show warnings for `shadcn/ui` components (`dialog.tsx`, `command.tsx`).
    *   *Status:* Low priority. Waiting for upstream library updates.
*   **Linting:** `cmdk-input-wrapper` attribute in `command.tsx` triggers `react/no-unknown-property`.
    *   *Status:* Suppressed via file-level `eslint-disable`.
*   **PWA Strategy:** Currently requires "Add to Home Screen" for full offline capability. Browser-only caching is standard HTTP cache + runtime SW.

## 📉 Pending Refactoring

*   **Graph View Bundle:** `react-force-graph-2d` is large. Monitor bundle size.
*   **Unit Tests:** Data utility functions (`src/lib/data-utils.ts`) handle complex logic (backlinks, path resolution) and would benefit from Vitest coverage.

## 🚀 Planned Features (ToDo)

### 1. AI & LLM Integration Expansion
*   **Implement `llms-full.txt`:**
    *   *Status:* ✅ Implemented.
    *   *Description:* A comprehensive, single-file Markdown representation of the entire blog's content to allow LLMs to fully ingest and understand the site's knowledge base. Available at `/llms-full.txt`.


### 2. IndieWeb & Social Interactions
*   **Webmentions Integration:**
    *   *Goal:* Enable decentralized conversations by receiving and displaying mentions (likes, reposts, replies) from other websites and social networks (via Bridgy).
    *   *Plan:*
        1.  Add `<link rel="webmention" href="https://webmention.io/..." />` to `Head.astro`.
        2.  Use `webmention.io` API to fetch mentions.
        3.  Create a client-side (or build-time) component to display mentions at the bottom of posts.

### 3. Interactive Playground
*   **Sandpack / Live Code:**
    *   *Goal:* Allow users to edit and run code snippets directly within technical articles.
    *   *Plan:* Integrate `Sandpack` (by CodeSandbox) for React/Node.js snippets.

### 4. Search & Discovery
*   **Enhanced Pagefind UI:**
    *   *Goal:* Improve the search experience with better result highlighting and snippets, potentially integrating it more deeply than the current Command Menu.

### 5. Analytics & Privacy
*   **Privacy-First Analytics:**
    *   *Goal:* Track usage without compromising user privacy or using heavy scripts.
    *   *Plan:* Evaluate self-hosted solutions like Umami or Plausible.

### 6. Accessibility (a11y)
*   **Automated Testing:**
    *   *Goal:* Prevent accessibility regressions.
    *   *Plan:* Integrate `axe-core` or similar tools into the CI/CD pipeline or pre-commit hooks.
