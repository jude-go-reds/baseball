# Baseball Card PRD

## 1. Goal
A public web app that generates a shareable baseball-card image for any MLB player (all eras), showing career stats and a player photo. Deployed on Vercel.

## 2. Users
Baseball fans who want a quick, attractive visual summary of a player's career — for social sharing, fantasy/discussion threads, or fun browsing.

## 3. User flows
- **Search flow**: Home → search by player name → results list → player page → card image (share/download).
- **Browse flow**: Home → explore galleries (Hall of Fame, by team, by era) → player page → card.
- No accounts. Cards are public and addressable by URL: `/card/[playerId]?style=modern`.

## 4. Functional requirements
- **Search**: name autocomplete; handles common variants. Disambiguate same-name players (e.g., the two Ken Griffeys) by showing team + years.
- **Player page**: rendered card + share button (copy link, download PNG).
- **Card image endpoint**: `/api/card/[playerId]` returns a PNG via `@vercel/og`.
- **Style picker**: 3 templates — Modern Topps, Vintage (1950s–70s), Minimalist data-viz. Style is a query param so each variant has its own URL.
- **Position-aware content**: hitter cards show batting stats; pitcher cards show pitching stats; two-way players (Ohtani, Ruth) show both.

## 5. Card content (career totals)
- **Header**: name, primary team(s), position, years active, photo.
- **Hitters**: AVG / OBP / SLG, HR, RBI, H, R, SB, OPS+, WAR, wRC+.
- **Pitchers**: W-L, ERA, ERA+, WHIP, K, IP, SV, WAR.
- **Honors strip**: MVPs, All-Star count, Gold Gloves, Silver Sluggers, Cy Youngs, World Series rings, HoF year.

## 6. Data sources
A composite approach to cover all eras and all stats:

**Stats — basic + counting (modern + historical)**
- **MLB Stats API** (`statsapi.mlb.com`) — free, official, real-time for active players; covers historical totals for most modern-era players.

**Stats — advanced metrics (WAR, OPS+, wRC+, ERA+) and historical awards**
- **FanGraphs and Baseball-Reference free exports** — both publish free, downloadable career-stat data (FanGraphs leaderboard CSVs, B-Ref's Lahman-compatible career tables). We'll import a snapshot at build time (or into Vercel KV/Postgres) and refresh it nightly.
- **Lahman Database** as a backup canonical source for awards (MVP, All-Star, Cy Young, Gold Glove, Silver Slugger, HoF) since it's the cleanest free dataset for historical honors.
- **Note**: confirm each source's terms of use before shipping; FanGraphs and B-Ref allow non-commercial use of their free data with attribution. Add an attribution line on the player page and in the app footer.

**Photos**
- **Primary**: MLB Content API headshots (`securea.mlb.com/mlb/images/players/head_shot/<id>.jpg`) — good coverage from ~1980 onward.
- **Fallback for pre-1980 players**: **Wikimedia Commons** public-domain / CC-licensed images, fetched via the Wikipedia/Wikimedia API by player name. Cache the resolved image URL per playerId.
- **Final fallback**: a generic silhouette placeholder if neither source returns an image.

## 7. Tech stack
- **Framework**: Next.js (App Router) on Vercel.
- **Image rendering**: `@vercel/og` (Edge runtime, JSX-based card templates).
- **Data layer**:
  - Server module wrapping MLB Stats API (live calls).
  - Static dataset (FanGraphs/B-Ref/Lahman merged) shipped as JSON or loaded into Vercel KV/Postgres at build time.
  - Wikimedia API client for pre-1980 photo lookups, results cached.
- **Caching**: `Cache-Control: public, s-maxage=86400` on card images keyed by `playerId+style`. Refresh nightly for active players via a Vercel Cron job.
- **Search index**: prebuilt `players.json` (id, name, aliases, years, team) at build time; client-side fuzzy search (Fuse.js).

## 8. Non-goals (V1)
- No accounts, saved collections, or user-uploaded data.
- No live in-game stats / season-in-progress updates.
- No team or season cards — players only.
- No native mobile app — responsive web only.

## 9. Risks
- **Image licensing**: confirm MLB's image API terms allow this use, and respect Wikimedia license requirements (attribution per file). Show source/attribution near the photo when required.
- **Data source ToS**: FanGraphs and B-Ref allow non-commercial reuse with attribution — verify before launch and credit them visibly.
- **`@vercel/og` size limits**: Edge function payload caps at ~1 MB; subset fonts and re-encode photos server-side before embedding.
- **Disambiguation**: many players share names — search results must show team + years.
- **Dataset freshness**: nightly cron refresh keeps active-player data current; retired-player data only needs to refresh after each season ends.

## 10. Milestones
1. **M1 — Skeleton**: Next.js on Vercel; `/card/[id]` returns a hardcoded card via `@vercel/og`.
2. **M2 — MLB data + search**: MLB Stats API integration; player search; basic+counting stats; one card style.
3. **M3 — Photos**: MLB headshots + Wikimedia fallback for pre-1980 players + silhouette placeholder.
4. **M4 — Advanced stats + awards**: FanGraphs/B-Ref/Lahman import pipeline; OPS+, WAR, wRC+, ERA+, honors strip.
5. **M5 — Style picker**: Modern Topps, Vintage, Minimalist templates.
6. **M6 — Browse galleries**: HoF, by team, by era.
