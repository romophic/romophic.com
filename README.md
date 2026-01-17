# romophic.com

A high-performance technical digital garden designed for deep interconnectedness and "God-Tier" UX.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)
![Astro](https://img.shields.io/badge/Astro-v5-orange?style=flat-square&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)

## ✨ Features

- **🕸 Interactive Knowledge Graph**
  - A fully custom visualization engine built with **D3-force** and **HTML5 Canvas**.
  - Features particle flow animations, manual hit-testing for reliable interaction, and dynamic LOD (Level of Detail).
  
- **⚡️ "God-Tier" Performance**
  - Built on **Astro v5** (Static Site Generation).
  - **Zero-runtime CSS** via Tailwind v4.
  - Smart image optimization with **LQIP** (Low Quality Image Placeholders) using CSS Grid stacking.

- **📖 Rich Content Experience**
  - **Math**: Full LaTeX support via KaTeX.
  - **Code**: Beautiful syntax highlighting with Expressive Code.
  - **Navigation**: Auto-generated TOC, bi-directional backlinks, and keyboard-driven command menu.

- **🛠 Robust Engineering**
  - **Strict Typing**: Zero `any` policy across the codebase.
  - **Centralized Logic**: `AppScript` architecture to manage state across View Transitions.
  - **Graph Theory**: O(N) backlink indexing engine.

## 🛠 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **UI Library**: [React](https://react.dev/) (Used sparingly for interactive islands)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualization**: [D3.js](https://d3js.org/)
- **Search**: [Pagefind](https://pagefind.app/)
- **Content**: MDX, Remark, Rehype

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📂 Project Structure

Please refer to [GEMINI.md](./GEMINI.md) for a comprehensive deep dive into the architecture, file structure, and design philosophy.

## 📄 License

MIT