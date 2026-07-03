# ball.town

Static site showing live pro-sports schedules per metro area, fetched
client-side from ESPN's unofficial API. No build step, no framework, no
dependencies, no API key. Plain ES5-style JS (IIFE, string concat — no
modules, no transpiling).

## Layout

- `index.html` — city picker landing page.
- `city/<slug>.html` — one hand-copied shell per city; `data-city` on
  `<body>` selects the config entry.
- `data/cities.js` — single source of truth for cities/teams
  (`window.BALLTOWN`).
- `assets/app.js` — all fetch + render logic.
- `assets/style.css` — all styling.

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

Follow README "Add a city". Pin `teamId` in `data/cities.js` — name
resolution (`match`) still works but costs one request per league team
on the core API, so it's a bootstrap convenience only. Also set
`short` (nickname for chips/strip). Verified ids:

- Minneapolis: Twins MLB 9, Lynx WNBA 8, Vikings NFL 16, United MLS
  17362, Timberwolves NBA 16, Wild NHL 30.
- Los Angeles: Dodgers MLB 19, Angels MLB 3, Sparks WNBA 6, Rams NFL
  14, Chargers NFL 24, LAFC MLS 18966, Galaxy MLS 187, Lakers NBA 13,
  Clippers NBA 12, Kings NHL 8, Ducks NHL 25.

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
  mobile only: Android via the `beforeinstallprompt` event (real
  install button); iOS Safari via static instructions (Share → Add to
  Home Screen) since iOS has no programmatic install. Dismissal is
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
