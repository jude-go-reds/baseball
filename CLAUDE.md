# Baseball Cards — project guide for Claude

@AGENTS.md

## Project summary
Public web app that generates shareable baseball-card PNGs for any MLB player (all eras). Next.js + `next/og` (`ImageResponse`), deployed on Vercel. **`PRD.md` in this folder is the source of truth for requirements** — read it before making non-trivial product decisions.

## Tech stack
- **Framework**: Next.js 16 (App Router), TypeScript.
- **Styling**: Tailwind CSS v4.
- **Image rendering**: `ImageResponse` from `next/og` (built into Next 16 — do **not** add `@vercel/og` as a separate dependency).
- **Search** (M2+): Fuse.js, client-side, against a prebuilt `public/players.json`.
- **Data sources**: MLB Stats API (live), plus a static historical dataset committed as JSON under `data/historical/` (M4+).
- **Deploy**: Vercel auto-deploys from GitHub `main`.

## Repo layout
- `app/` — App Router routes.
  - `app/page.tsx` — home page.
  - `app/card/[id]/page.tsx` — player page with embedded card image.
  - `app/api/card/[id]/route.tsx` — `ImageResponse` PNG endpoint.
- `lib/` — server-side modules. **All player data must flow through `lib/players/getPlayer(id)` once it exists** — never call MLB API or read the historical JSON directly from a route or page.
  - `lib/cards/templates/` — one file per visual style (`modern.tsx`, later `vintage.tsx`, `minimalist.tsx`). All accept the same `Player` prop.
  - `lib/cards/demoData.ts` — temporary M1 hardcoded player data; delete in M2.
- `data/historical/` (M4+) — committed merged dataset (FanGraphs / B-Ref / Lahman).
- `scripts/` (M2+) — build-time data jobs (search-index builder, historical-import).
- `public/` — static assets (silhouette fallback, `players.json` search index).

## How to run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000. Card endpoint: `/api/card/<id>?style=modern`. The only id wired up in M1 is `ruth`.

## How to deploy
Push to `main` on GitHub. Vercel auto-deploys. For preview branches use `vercel` (Vercel CLI).

## Next.js 16 specifics (don't get caught by stale training data)
- **Dynamic route params are async**: `params: Promise<{ id: string }>` — must `await params` in pages and route handlers.
- **Route handler context typing**: use the global `RouteContext<'/api/card/[id]'>` helper — no import needed, types regenerate on `next dev`/`next build`.
- **Image generation**: `import { ImageResponse } from 'next/og'`. **Bundle size cap is 500KB** (JSX + CSS + fonts + inlined images combined). Subset fonts and re-encode photos before passing to `ImageResponse`.
- **Satori/CSS limits**: only flexbox is supported (no CSS grid). Every `<div>` containing siblings must have `display: flex`. Special characters like bullets need to be inserted via `String.fromCharCode` or escapes — Satori is strict about font glyph coverage.

## Conventions
- Card templates: one file per style under `lib/cards/templates/`, all accept the same `Player` prop. Branch on `player.position` for hitter/pitcher/two-way.
- Player data flows through `lib/players/getPlayer(id)` (M2+). M1 uses `lib/cards/demoData.ts` as a placeholder.
- The `/api/card/[id]` route returns `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`.
- Photos (M3+): try MLB headshot, fall back to Wikimedia, fall back to silhouette. Always re-encode server-side before embedding.

## Data sources & attribution
Per PRD §6 / §9, every page that displays stats must credit the sources in the footer:
- MLB Stats API (live & modern-era totals)
- FanGraphs free leaderboard exports (advanced metrics)
- Baseball-Reference free career tables
- Lahman Database (historical awards)
- Wikimedia Commons (pre-1980 photos, per-file attribution)

Re-verify the FanGraphs / B-Ref free-data terms before importing in M4. If terms have tightened, fall back to Lahman-only.

## What NOT to do
- Don't add a database (Postgres / KV) before it's actually needed — start with committed JSON.
- Don't fetch photos at request time without a placeholder fallback.
- Don't ship without source attribution on every stats-bearing page.
- Don't install `@vercel/og` — use `next/og`.
- Don't bypass `getPlayer(id)` once it exists; routes must not talk to MLB API directly.

## Roadmap
M1 (skeleton, hardcoded card) → M2 (MLB API + search) → M3 (photos) → M4 (advanced stats + awards) → M5 (style picker) → M6 (browse galleries). Detailed plan saved at `~/.claude/plans/make-a-plan-to-buzzing-emerson.md`.
