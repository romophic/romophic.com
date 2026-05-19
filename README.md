# romophic.com

A minimalist, high-performance technical blog and personal portfolio. Built with Astro v6, emphasizing extreme maintainability, zero-runtime CSS, and a completely native Astro Collections architecture.

![Astro](https://img.shields.io/badge/Astro-v6-orange?style=flat-square&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)

## ✨ Features

- **⚡️ Pure Astro v6 Architecture**
  - **Native Content Collections**: Fully leverages Astro's `reference()` for defining robust, type-safe relationships between authors, parent posts, and subposts.
  - **Build-Time AST Parsing**: Custom remark plugins (`unist-util-visit`) safely extract internal links and reading times at build time, eliminating fragile regex and reducing runtime overhead.
  - **Zero-runtime CSS** via Tailwind v4.

- **🕸 Interactive Knowledge Graph**
  - A fully custom visualization engine built with **D3-force** and **HTML5 Canvas**.
  - Visualizes the interconnected relationships between tags, posts, and subposts.

- **📖 Rich Content Experience**
  - **Hierarchy & Subposts**: Supports complex, multi-page articles (parent/child relationships) seamlessly integrated with auto-generated TOCs and navigation.
  - **Math**: Full LaTeX support via KaTeX.
  - **Code**: Beautiful syntax highlighting with Expressive Code.
  - **Search**: Fully static, lightning-fast search powered by Pagefind.
  - **Dynamic OGP**: Satori-based automated Open Graph image generation.

- **🛠 Robust Engineering**
  - **Strict Typing**: Zero `any` policy across the codebase enforced by strict ESLint rules.
  - **Dependency Minimalism**: Removed all unnecessary third-party packages in favor of vanilla JS and standard Astro features.

## 🛠 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualization**: [D3.js](https://d3js.org/)
- **Search**: [Pagefind](https://pagefind.app/)
- **Content Parsing**: MDX, Remark, Rehype
- **Testing**: Vitest

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📄 License

MIT