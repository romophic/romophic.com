# Development Guide & Philosophy

This document serves as the "North Star" for **romophic.com**. It outlines the ideal development workflow, coding standards, and the ultimate vision for the project. Use this guide to maintain "Vibe Coding" momentum—fast, intuitive, and high-quality development.

## 🌟 Project Philosophy

**romophic.com** is more than a blog; it's a high-performance digital garden.
*   **Extreme Performance:** Every byte counts. Prioritize static generation, efficient assets, and minimal client-side JavaScript.
*   **God-Tier UX:** Interactions should be fluid and delightful. (e.g., smooth zooms, instant transitions, command menus).
*   **Developer Ergonomics:** Writing content (MDX) and adding features should be frictionless.

## 🛠 Development Workflow (The "Vibe" Loop)

To maintain speed and quality, follow this loop for every feature or fix:

### 1. Plan & Strategize
*   **Clarify Intent:** What is the user goal? (e.g., "I want to see backlinks to explore related ideas.")
*   **Check `STATUS.md`:** Ensure the feature isn't already implemented or conflicting with known issues.
*   **Break Down:** Split complex tasks into atomic subtasks.

### 2. Implement (Step-by-Step)
*   **Atomic Changes:** Make small, testable changes.
*   **Component-First:** Build UI components in isolation (`src/components/ui`) before integrating.
*   **Type Safety:** Define interfaces first. Avoid `any`.

### 3. Verify & Polish
*   **Lint & Format:** Run checks *before* committing.
    ```bash
    pnpm prettier # Format code
    pnpm lint     # Check for errors
    pnpm build    # Verify production build
    ```
*   **Manual Test:** Verify the UX. Does it *feel* right?

### 4. Ship
*   **Commit:** Use conventional commits.
    ```bash
    git add .
    git commit -m "feat: add interactive graph view"
    ```
*   **Push:** Deploy to production.

## 📐 Coding Standards

*   **Framework:** Astro + React (for interactive islands) + Tailwind CSS v4.
*   **Styling:** Use `src/styles/global.css` variables for theming. Avoid hardcoded hex values.
*   **State Management:** Local state (`useState`) preferred. Use URL state for shareable UI states.
*   **Images:** Always use `src/components/MDXImage.astro` or `ZoomableImage` for content images to ensure optimization and LQIP.

## 🔮 Future Goals (The "Ideal" State)

*   **Interactive Playground:** Embeddable code playgrounds for technical articles.
*   **AI-Powered Search:** Semantic search using vector embeddings (beyond simple text match).
*   **Personalized Feeds:** Dynamic content recommendation based on user reading history (local storage based).
*   **3D Visualizations:** More WebGL experiments integrated into the blog.

## 📂 Directory Structure (Mental Map)

*   `src/content/`: MDX source of truth.
*   `src/components/ui/`: Shadcn-like React components.
*   `src/lib/`: Core logic (data fetching, graph algorithms).
*   `src/pages/`: Astro file-based routing.
