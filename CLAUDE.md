# ball.town

Static site showing pro-sports schedules per metro area. Schedules are
precomputed once a day from ESPN's unofficial API into a static JSON
cache; the browser reads that cache and never calls ESPN. No framework,
no runtime deps, no API key. Plain ES5-style client JS (IIFE, string
concat — no modules, no transpiling). City pages are generated from
config by a small Node script; all output is committed and served
statically (Cloudflare Pages, domain ball.town).

## Layout

- `data/cities.js` — **single source of truth** for cities/teams. Dual
  environment: `<script>` sets `window.BALLTOWN` in the browser;
  `module.exports` lets the generator import it in Node.
- `tools/city.template.html` — the one city-page skeleton. Edit this to
  change structure for every city.
- `tools/build.mjs` — page generator: writes `city/<slug>.html` +
  `city/<slug>.webmanifest` per city and rebuilds the `index.html` cards
  between the `CITIES:START`/`CITIES:END` markers.
- `tools/fetch-schedules.mjs` — data fetcher: hits ESPN once per team
  (server-side) and writes `data/schedules.json`, the cache the browser
  reads. Ports the exact core-API logic the client used to run live.
- `data/schedules.json` — **generated; never hand-edit.** The daily
  schedule cache, keyed by `<sportPath>:<teamId>`. Committed and served.
- `.github/workflows/refresh.yml` — daily cron: runs the fetcher,
  commits `schedules.json`, which triggers a Cloudflare Pages redeploy.
- `city/<slug>.html`, `city/<slug>.webmanifest` — **generated; never
  hand-edit** (they carry a "GENERATED FILE" banner). `data-city` on
  `<body>` selects the config entry.
- `index.html` — city picker; cards between the markers are generated.
- `assets/app.js` — client render logic + one fetch of `schedules.json`.
- `assets/style.css` — all styling.
- `_headers` — Cloudflare Pages caching: everything `max-age=0,
  must-revalidate` so deploys + the daily refresh show up immediately
  (Pages' default 4h asset cache would otherwise hide them).
- `robots.txt` — static; allows all crawlers, points to the sitemap.
- `sitemap.xml` — **generated** by build.mjs (home + every city URL);
  never hand-edit. `tools/city.template.html` also carries per-page SEO
  meta (description, canonical, Open Graph, Twitter card) filled from
  config; `index.html`'s are static in its `<head>`. Canonical origin
  is hardcoded `https://ball.town` in build.mjs (`SITE`).
- `functions/live.js` — Cloudflare Pages Function served at `/live`.
  Polls ESPN scoreboards for **in-progress** games, returns a compact
  `{games:{"<sportPath>:<teamId>":{us,them,status}}}` map (both sides of
  each game), edge-cached 30s via the Cache API. Auto-deploys with the
  repo — no Worker/KV/cron. app.js polls it every 30s and overlays the
  score onto each team's current game (`startLive`).

## Two pipelines: pages (structure) and data (schedules)

- **Pages** — `npm run build` (`tools/build.mjs`). Run after editing
  `data/cities.js` or `tools/city.template.html`; commit the regenerated
  `city/*` + `index.html`. Editing `assets/*.js|css` needs no rebuild.
- **Data** — `npm run fetch` (`tools/fetch-schedules.mjs`). Rebuilds
  `data/schedules.json`. Runs daily in CI; run locally if you want fresh
  data now. Adding a city = one config entry, then **both** `build`
  (new page) and `fetch` (new team schedules).

Nothing runs on the host — Cloudflare Pages just serves committed files.

## Run / verify

```
python -m http.server 8000
# open http://localhost:8000/city/minneapolis.html
```

There are no tests. Verify by loading the page: the network tab should
show **one** request to `data/schedules.json` and **zero** to espn.com.
Every team card shows upcoming games, an "Offseason" pill (empty
schedule), or an "Unavailable" pill (team missing from the cache).

## ESPN API — hard-won constraints (July 2026)

Only `tools/fetch-schedules.mjs` (server-side, daily) touches ESPN now —
the browser reads the static cache. The core-API notes below still apply
to the fetcher; CORS no longer matters (server-side) but the core API
stays the source of truth because the richer `site.api` `/schedule`
endpoint drops preseason/next-season games inconsistently per league.

- **Only `sports.core.api.espn.com` sent CORS headers** (why the browser
  was limited to it; moot now but the fetcher still uses it). The richer
  `site.api.espn.com` / `site.web.api.espn.com` hosts return valid JSON
  to curl but browsers cannot fetch them cross-origin.
- Core API URL shape: `/v2/sports/{sport}/leagues/{league}/...` — note
  the extra `leagues/` segment vs. the `sportPath` config values
  ("baseball/mlb"). `leaguePath()` in app.js does the conversion.
- Collections (teams, events) return `$ref` link lists, not inline
  objects. Every `$ref` is `http://` — upgrade to `https://` before
  fetching (`getJSON` does this).
- Team events: `/teams/{id}/events?dates=YYYYMMDD-YYYYMMDD&limit=N`
  works without a season segment and is date-filtered server-side.
  **The sort direction varies by league** (MLB ascending, MLS
  descending), and no `sort` param is honored — the fetcher probes the
  first and last ref to detect direction.
- Event objects: `name` is always "Away Team at Home Team" (all
  leagues, including soccer); `competitions[0].competitors[*]` has
  `id`/`homeAway` inline but `team` is a `$ref`. `seasonType` is a
  `$ref` ending in `/types/{n}`; type 1 = Preseason in the US leagues
  but **Regular Season in soccer**, so the preseason tag skips soccer.
- Broadcast channels: `competitions[0].broadcasts` is a `$ref` to a
  collection (one request per game). Each item has
  `media.shortName` and `market.type` — `National`, `Home`, or `Away`
  relative to the game's sides. The fetcher keeps National feeds plus the
  feed for our team's side and drops the opponent's regional channel
  (`channelsFor`). Zero broadcasts for a future game is normal (assigned
  late, e.g. NFL preseason).
- Each broadcast item also has `type.shortName` ("TV" / "Streaming" /
  "Radio"). The **"Nat'l TV"** tag flags games with a `market:National`
  **and** `type:TV` broadcast — this excludes the always-on league
  streaming packages (MLB.TV, League Pass are `Streaming`) that would
  otherwise mark nearly every game national. Stored as `national:true`
  in schedules.json; app.js renders it (and the `label:"Preseason"` tag)
  as small pills in the game row.
- A team with zero events in the ~8-month window is a real state
  (leagues publish next season's schedule late) — that's the
  "Offseason" card, not a bug.

## Adding cities / teams

Edit `data/cities.js` (one entry), then `npm run build` (page) **and**
`npm run fetch` (schedules) — see README "Add a city". Pin `teamId`
(the fetcher keys off it; there's no runtime name-resolution fallback
anymore). Also set `short` (chips/strip nickname) and `abbr` (home-screen
code). All pinned ids live in `data/cities.js` (10 metros as of this
writing).

Bulk-resolving ids/colors/venues (for adding many markets at once):
don't use the CORS-only core API — hit the richer **`site.api.espn.com`
/apis/site/v2/sports/{sportPath}/teams?limit=400`** server-side (Node).
It returns every team inline in one request per league with `id`,
`color`, `alternateColor`, `displayName`. Venue is at the team-detail
endpoint under `team.franchise.venue.fullName` + `.address.city`. Match
`match` within the correct `sportPath` list (ids are per-league, so the
same number can repeat across leagues — that's fine). Process with a
throwaway script that prints only compact results so the big payloads
never enter context; the 10-city set was built this way. In-season
leagues (MLB/WNBA/MLS in summer) verify ids via real schedules;
offseason cards (NFL/NBA/NHL) only prove the id resolves, not the
schedule.

## Installable web app (Add to Home Screen)

- Each city is its own installable PWA. Home-screen name is
  `ball.town <ABBR>` — set in **two** places per city that must agree:
  `apple-mobile-web-app-title` meta (iOS reads this) and the manifest
  `name`/`short_name` (Android reads this). iOS ignores the manifest
  name; Android ignores the meta.
- Manifests are static per-city files (`city/<slug>.webmanifest`) with
  relative icon/start_url paths that resolve against the manifest's own
  `/city/` location. Icons are shared PNGs in `assets/icons/`
  (192/512 + 512 maskable for Android, 180 apple-touch-icon for iOS) —
  Android install requires valid 192+512 icons or it won't offer.
- `initInstallPrompt()` in app.js shows a dismissible bottom banner on
  mobile only, with three UA-specific variants: Chromium Android
  (`kind:"android"`) gets a real one-tap Install button via the
  `beforeinstallprompt` event; iOS Safari (`"ios"`) and Firefox Android
  (`"firefox"`) get manual instructions, because `beforeinstallprompt`
  is Chromium-only — neither WebKit nor Gecko fires it. The iOS copy is
  exact ("Tap ⊙ then ⬆ Share then ＋ Add to Home Screen") and must stay
  in sync with the current Safari share-sheet flow. Dismissal is
  remembered in `localStorage` (`balltown:a2hs-dismissed`); hidden when
  already running standalone. Can't be exercised in the localhost
  preview (needs real mobile UA + HTTPS) — verify on a phone.
- `assets/icons/*.png` are dependency-free generated placeholders (see
  scratchpad `genicons.py` approach); replace with real art at the same
  filenames/sizes.

## Sticky mobile header

- `initStickyHeader()` injects a `.ministicky` bar (fixed, top) that
  slides in once the page's `.topbar` scrolls out of view. Shows
  `ball.town <abbr> · All cities`, where `abbr` comes from
  `data/cities.js` (`abbr: "MSP"` etc.). CSS gates it to `max-width:720px`
  (mobile only) — desktop keeps `display:none`.
- Note: `abbr` (cities.js) drives the sticky header; the *installed app*
  name is still the static `apple-mobile-web-app-title` meta + manifest
  `short_name`. Keep all three consistent per city.
- The scroll toggle uses a `scroll` listener + `requestAnimationFrame`.
  The offscreen dev-preview pauses scroll events, rAF, and CSS
  transitions, so the slide-in can't be exercised there — verify the
  animation on a real device / visible tab. The CSS override
  (`.ministicky.show{transform:none}`) and layout are testable
  statically (disable the transition, toggle the class).

## Gotchas

- `.wrap{margin:0 auto}` does the horizontal centering. Section rules
  (`.teams`, `.upnext`, `footer`, `.city-grid`) must set only
  `margin-top`/`margin-bottom` — a `margin:X 0 Y` shorthand on the
  same element resets the horizontal `auto` and glues the section to
  the left edge on wide screens.
- ESPN's broadcast market labels are unreliable: the opponent's own
  stream is sometimes tagged with our market (e.g. Padres.TV marked
  "Home" at Dodger Stadium). `channelsFor` (in the fetcher) therefore
  also drops any feed whose name contains the opponent's nickname.

- Files are UTF-8 with en-dashes/middle dots ("Minneapolis–St. Paul",
  "MLB · Baseball"). Don't edit them with PowerShell
  `Get-Content`/`Set-Content` without explicit UTF-8 encoding — it
  mojibakes them. Use the Edit/Write tools.
- All times render via `Intl.DateTimeFormat` in the VIEWER's local
  zone (no `timeZone` option), with the zone abbreviation from
  `localTzLabel()`. The `tz`/`tzLabel` fields in `data/cities.js` are
  currently unused (kept for a possible "city time" toggle).
- The site is dark-theme only (`:root` palette + `color-scheme:dark`).
  Team primary colors used as foreground are lifted toward white with
  `color-mix(... var(--lift))` so near-black teams (Kings, LAFC) stay
  visible — keep doing that for any new use of `--t1`/`--tc` as text
  or icon color on dark backgrounds.
- `sessionStorage` caches resolved team ids under `balltown:id:*` —
  clear it when testing resolution changes.
