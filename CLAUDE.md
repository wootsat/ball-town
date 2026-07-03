# ball.town

Static site showing live pro-sports schedules per metro area, fetched
client-side from ESPN's unofficial API. No framework, no runtime deps,
no API key. Plain ES5-style client JS (IIFE, string concat — no modules,
no transpiling). City pages are generated from config by a small Node
script; the output is committed and served statically.

## Layout

- `data/cities.js` — **single source of truth** for cities/teams. Dual
  environment: `<script>` sets `window.BALLTOWN` in the browser;
  `module.exports` lets the generator import it in Node.
- `tools/city.template.html` — the one city-page skeleton. Edit this to
  change structure for every city.
- `tools/build.mjs` — generator: writes `city/<slug>.html` +
  `city/<slug>.webmanifest` per city and rebuilds the `index.html` cards
  between the `CITIES:START`/`CITIES:END` markers.
- `city/<slug>.html`, `city/<slug>.webmanifest` — **generated; never
  hand-edit** (they carry a "GENERATED FILE" banner). `data-city` on
  `<body>` selects the config entry.
- `index.html` — city picker; cards between the markers are generated.
- `assets/app.js` — all fetch + render logic (client-side).
- `assets/style.css` — all styling.

## Build (generating pages)

```
npm run build     # or: node tools/build.mjs
```

Run after editing `data/cities.js` or `tools/city.template.html`, then
commit the regenerated files. GitHub Pages does NOT run this — it serves
the committed output. Editing `assets/*.js|css` needs no rebuild.
Adding a city = one config entry + a rebuild.

## Run / verify

```
python -m http.server 8000
# open http://localhost:8000/city/minneapolis.html
```

There are no tests. Verify by loading the page: every team card should
show either upcoming games, an "Offseason" pill (legitimately empty
schedule), or an "Unavailable" pill (a fetch failed — check the
console).

## ESPN API — hard-won constraints (July 2026)

- **Only `sports.core.api.espn.com` sends CORS headers.** The richer
  `site.api.espn.com` and `site.web.api.espn.com` hosts return valid
  JSON to curl but browsers cannot fetch them cross-origin (no
  `Access-Control-Allow-Origin`, no JSONP). Do not "simplify" back to
  them without re-testing CORS in a real browser.
- Core API URL shape: `/v2/sports/{sport}/leagues/{league}/...` — note
  the extra `leagues/` segment vs. the `sportPath` config values
  ("baseball/mlb"). `leaguePath()` in app.js does the conversion.
- Collections (teams, events) return `$ref` link lists, not inline
  objects. Every `$ref` is `http://` — upgrade to `https://` before
  fetching (`getJSON` does this).
- Team events: `/teams/{id}/events?dates=YYYYMMDD-YYYYMMDD&limit=N`
  works without a season segment and is date-filtered server-side.
  **The sort direction varies by league** (MLB ascending, MLS
  descending), and no `sort` param is honored — app.js probes the first
  and last ref to detect direction.
- Event objects: `name` is always "Away Team at Home Team" (all
  leagues, including soccer); `competitions[0].competitors[*]` has
  `id`/`homeAway` inline but `team` is a `$ref`. `seasonType` is a
  `$ref` ending in `/types/{n}`; type 1 = Preseason in the US leagues
  but **Regular Season in soccer**, so the preseason tag skips soccer.
- Broadcast channels: `competitions[0].broadcasts` is a `$ref` to a
  collection (one request per game). Each item has
  `media.shortName` and `market.type` — `National`, `Home`, or `Away`
  relative to the game's sides. The app shows National feeds plus the
  feed for our team's side and drops the opponent's regional channel.
  Zero broadcasts for a future game is normal (assigned late, e.g.
  NFL preseason).
- A team with zero events in the ~8-month window is a real state
  (leagues publish next season's schedule late) — that's the
  "Offseason" card, not a bug.

## Adding cities / teams

Edit `data/cities.js` (one entry) then `npm run build` — see README
"Add a city". Pin `teamId` — name resolution (`match`) still works but
costs one request per league team on the core API, so it's a bootstrap
convenience only. Also set `short` (chips/strip nickname) and `abbr`
(home-screen code). All pinned ids live in `data/cities.js` (10 metros
as of this writing).

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
  "Home" at Dodger Stadium). `fetchChannels` therefore also drops any
  feed whose name contains the opponent's nickname.

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
