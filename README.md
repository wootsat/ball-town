# ball.town

Every pro team in your city, one page. Live schedules for NFL, NBA, MLB,
NHL, MLS, and WNBA teams, grouped by metro area.

## How it works

- Plain static site — no framework, no API key, nothing to serve but
  files. City pages are generated from config by a tiny dependency-free
  Node script (`tools/build.mjs`); the generated files are committed, so
  the host just serves static files.
- Schedules are **precomputed once a day** into `data/schedules.json` by
  `tools/fetch-schedules.mjs` (run in CI). The browser reads that one
  small file — it never calls ESPN directly. This decouples ESPN load
  from visitor count, so the site scales to any traffic.
- The daily fetcher pulls from `sports.core.api.espn.com` server-side.
  (It's the host the browser used to be limited to for CORS reasons;
  server-side CORS is moot, but it's kept as the source of truth because
  the richer `site.api.espn.com` `/schedule` endpoint drops preseason /
  next-season games inconsistently across leagues.)
- `data/cities.js` is the single source of truth for cities and teams;
  each team pins its ESPN `teamId`.

## Run it locally

From the project root:

```bash
python3 -m http.server 8000
# or: npx serve
```

Then open http://localhost:8000/mn (each city is served at its short
code, e.g. `/mn`, `/la`, `/nyc`)

(Opening the HTML file directly from disk usually works too, but a local
server is more reliable.)

## Add a city

1. Add one entry to `data/cities.js` (copy the Minneapolis block; the
   key is the internal slug). Set `abbr` (the home-screen-app code, e.g.
   `MN`, `LA`) — its lowercase is also the short URL (`ball.town/mn`);
   override with a `code` field if you want a different path. Pin each
   team's ESPN `teamId` — leave it off for the first load and the app
   resolves it from the `match` name, then pin the id it found. `tagline`
   and `stripLabel` are optional.
2. Run the generator:

   ```bash
   npm run build     # or: node tools/build.mjs
   ```

That's it. The generator writes `<code>/index.html` and
`<code>/<code>.webmanifest` from `tools/city.template.html` (served at
`ball.town/<code>`), rebuilds the city cards on `index.html`, and updates
`sitemap.xml` + `_redirects`. Commit the generated files.

To change the page skeleton for **every** city (add an element, a new
`<head>` tag, restructure the header), edit `tools/city.template.html`
once and re-run the generator. Look/behavior changes still live in
`assets/style.css` / `assets/app.js` and need no rebuild. Never
hand-edit the generated `<code>/*` files — they're regenerated.

The app icons in `assets/icons/` are shared across all cities — no
per-city icon work. See `assets/icons/README.md` to swap in real art.

League paths for `sportPath`:

| League | sportPath        |
|--------|------------------|
| NFL    | football/nfl     |
| NBA    | basketball/nba   |
| WNBA   | basketball/wnba  |
| MLB    | baseball/mlb     |
| NHL    | hockey/nhl       |
| MLS    | soccer/usa.1     |

## Schedule data (the daily cache)

`data/schedules.json` is a **generated file** — the cache every visitor
reads. Rebuild it with:

```bash
npm run fetch     # or: node tools/fetch-schedules.mjs
```

It hits ESPN once per team (server-side) and writes the upcoming games +
channels the client renders. In production this runs automatically via
`.github/workflows/refresh.yml` (daily cron), which commits the updated
`schedules.json`; the push triggers a Cloudflare Pages redeploy. You can
also trigger it manually from the repo's **Actions** tab. Never hand-edit
`data/schedules.json`.

## Live scores

In-progress scores are served separately from the daily cache by
`functions/live.js` — a **Cloudflare Pages Function** at `/live`. It
polls ESPN's scoreboards for games currently in progress and returns a
small map keyed by team, edge-cached ~30s. The client (`app.js`) polls
`/live` every 30s and overlays the score + game state (e.g. "Bot 7",
"3Q 3:46") onto each team's current game.

It needs **no extra setup** — Cloudflare Pages compiles the `functions/`
directory automatically on deploy, and the Cache API needs no KV/cron.
ESPN is hit at most ~once per 30s per edge location regardless of
traffic. (Local `python -m http.server` doesn't run Functions, so live
overlays only appear on the deployed site.)

## Known limitations / roadmap

- **Unofficial data source.** ESPN's endpoints are undocumented and
  could change without notice. If this project grows beyond a hobby
  site, plan to move to a supported source (e.g. TheSportsDB premium).
  The daily fetcher is the one place that touches ESPN, so it's the only
  thing that would need swapping.
- **Schedules are up to ~24h stale** (daily refresh) — fine for upcoming
  games. **Live in-progress scores** are separate and near-real-time via
  the `/live` Pages Function (edge-cached ~30s; the client polls it).
- Some leagues publish next season's schedule late — offseason teams
  correctly show an "Offseason" state.
- Not yet done: remaining metro areas (TV/broadcast info + live scores
  are in), ticket links, per-league filtering, post-game "Final" states
  (the live layer currently overlays in-progress games only).

## Deploying

Hosted on **Cloudflare Pages** (unmetered bandwidth → scales to large
traffic on the free tier), serving the domain **ball.town**. Source
stays on GitHub; Cloudflare Pages is connected to the repo and
auto-deploys on push to `main`.

Cloudflare Pages project settings:

- Framework preset: **None**
- Build command: **(empty)** — pages are pre-generated and committed
  (see "Add a city"); Cloudflare just serves the repo
- Build output directory: **/** (repo root)
- Production branch: **main**

DNS for ball.town is managed by Cloudflare (nameservers pointed there),
so the apex domain + HTTPS are handled automatically via the Pages
"Custom domains" tab.

Caching is controlled by the `_headers` file (a Cloudflare Pages
feature): everything is served `max-age=0, must-revalidate`, so a deploy
or the daily data refresh reaches visitors on their next load — no stale
JS/CSS, no hard-refresh needed. Unchanged files still return a 304, so
it costs a tiny conditional request per load, not bandwidth. (Cloudflare
Pages' default is a 4-hour asset cache, which would hide deploys for
hours — hence this override.)

All asset paths are relative, so the site also works unchanged from a
subpath (e.g. GitHub Pages at `/ball-town/`) if you ever need a
fallback host.

Discoverability: `npm run build` also emits `sitemap.xml` (home + every
city), there's a static `robots.txt` pointing to it, and every page
carries meta description + canonical + Open Graph/Twitter tags so search
engines index it and shared links preview nicely. After the first
deploy, submit `https://ball.town/sitemap.xml` in Google Search Console
to speed up indexing. (Social previews use the app icon; swap in a
1200×630 banner image later if you want richer cards.)
