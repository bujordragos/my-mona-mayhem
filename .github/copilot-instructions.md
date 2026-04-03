# Mona Mayhem Workspace Instructions

## Project Overview

- Mona Mayhem is an Astro 5 server-rendered app scaffold for a GitHub contribution battle arena.
- Core app code lives in `src/pages/`.
- Primary entry page: `src/pages/index.astro`.
- API route scaffold: `src/pages/api/contributions/[username].ts`.
- Runtime and adapter are configured in `astro.config.mjs` (Node adapter, standalone server output).
- TypeScript strict mode is enabled in `tsconfig.json`.
- Ignore `workshop/` content when implementing or modifying product code.

## Build And Dev Commands

- Install dependencies: `npm ci`
- Start development server: `npm run dev`
- Build production output: `npm run build`
- Preview production build: `npm run preview`
- Run Astro CLI directly when needed: `npm run astro`
- No automated test command is configured in this scaffold.

## Astro Best Practices For This Repo

- Use explicit Astro route typing in API files:
  - `import type { APIRoute } from 'astro'`
  - `export const GET: APIRoute = async (...) => { ... }`
- Keep dynamic API routes non-prerendered unless there is a clear reason otherwise:
  - `export const prerender = false`
- In `.astro` pages, keep server logic in frontmatter and markup below it.
- Preserve baseline document metadata in pages:
  - `<html lang="en">`
  - `<meta name="viewport" content="width=device-width" />`
  - `<meta name="generator" content={Astro.generator} />`
- Return JSON from API routes with explicit status codes and content type headers.
- Respect strict TypeScript settings and avoid `any` unless there is no practical typed alternative.

## Design Guide (Retro Arcade Theme)

- **Colors**:
  - Background: Dark (`#0a0a1a`)
  - Primary Accent (Neon Green): `#5fed83`
  - Secondary Accent (Neon Purple): `#8a2be2`
- **Typography**: Complete 8-bit aesthetic utilizing `"Press Start 2P"` from Google Fonts.
- **Animation Style**:
  - **Scanlines**: Global CRT scanline effects applying an overlay on main containers.
  - **Neon Glows**: Heavy `text-shadow` and `box-shadow` styles to mimic pulsating neon signs for headings and interactions.
  - **Motion**: Inputs and results feature "float-in" entry animations; cards incorporate traversing "shimmer/shine" absolute pseudo-elements.

## Useful References

- Project setup and context: `README.md`
- Workshop learning path (reference only, do not duplicate into product tasks): `workshop/`
- Astro runtime config: `astro.config.mjs`
- TypeScript config: `tsconfig.json`
- Main page scaffold: `src/pages/index.astro`
- Contributions API scaffold: `src/pages/api/contributions/[username].ts`
