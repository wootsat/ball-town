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

Then open http://localhost:8000/city/minneapolis.html

(Opening the HTML file directly from disk usually works too, but a local
server is more reliable.)

## Add a city

1. Add one entry to `data/cities.js` (copy the Minneapolis block; the
   key is the URL slug). Set `abbr` (the 3-letter home-screen-app code,
   e.g. `MSP`, `LA`) and pin each team's ESPN `teamId` — leave it off
   for the first load and the app resolves it from the `match` name,
   then pin the id it found. `tagline` and `stripLabel` are optional.
2. Run the generator:

   ```bash
   npm run build     # or: node tools/build.mjs
   ```

That's it. The generator writes `city/<slug>.html` and
`city/<slug>.webmanifest` from `tools/city.template.html`, and rebuilds
the city cards on `index.html`. Commit the generated files.

To change the page skeleton for **every** city (add an element, a new
`<head>` tag, restructure the header), edit `tools/city.template.html`
once and re-run the generator. Look/behavior changes still live in
`assets/style.css` / `assets/app.js` and need no rebuild. Never
hand-edit `city/*.html` or `city/*.webmanifest` — they're regenerated.

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

## Known limitations / roadmap

- **Unofficial data source.** ESPN's endpoints are undocumented and
  could change without notice. If this project grows beyond a hobby
  site, plan to move to a supported source (e.g. TheSportsDB premium).
  The daily fetcher is the one place that touches ESPN, so it's the only
  thing that would need swapping.
- **Data is up to ~24h stale** (daily refresh). Fine for upcoming
  schedules; live in-game scores would need a separate near-real-time
  layer (see the `live` overlay hooks in app.js — currently dummy data).
- Some leagues publish next season's schedule late — offseason teams
  correctly show an "Offseason" state.
- Not yet done: remaining metro areas (TV/broadcast info is in),
  ticket links, per-league filtering, real live scores.

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

All asset paths are relative, so the site also works unchanged from a
subpath (e.g. GitHub Pages at `/ball-town/`) if you ever need a
fallback host.
