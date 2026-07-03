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
- A team with zero events in the ~8-month window is a real state
  (leagues publish next season's schedule late) — that's the
  "Offseason" card, not a bug.

## Adding cities / teams

Follow README "Add a city". Pin `teamId` in `data/cities.js` — name
resolution (`match`) still works but costs one request per league team
on the core API, so it's a bootstrap convenience only. Verified ids for
Minneapolis: Twins MLB 9, Lynx WNBA 8, Vikings NFL 16, United MLS
17362, Timberwolves NBA 16, Wild NHL 30.

## Gotchas

- Files are UTF-8 with en-dashes/middle dots ("Minneapolis–St. Paul",
  "MLB · Baseball"). Don't edit them with PowerShell
  `Get-Content`/`Set-Content` without explicit UTF-8 encoding — it
  mojibakes them. Use the Edit/Write tools.
- All times render via `Intl.DateTimeFormat` with the city's `tz` from
  config; never format dates in the viewer's local zone.
- `sessionStorage` caches resolved team ids under `balltown:id:*` —
  clear it when testing resolution changes.
