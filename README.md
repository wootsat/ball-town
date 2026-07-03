# ball.town

Every pro team in your city, one page. Live schedules for NFL, NBA, MLB,
NHL, MLS, and WNBA teams, grouped by metro area.

## How it works

- Plain static site — no framework, no API key, nothing to serve but
  files. City pages are generated from config by a tiny dependency-free
  Node script (`tools/build.mjs`); the generated files are committed, so
  the host just serves static HTML (GitHub Pages does not run the
  script).
- Each city page fetches upcoming schedules **live in the browser** from
  ESPN's public (unofficial) API on every page load. Refreshing the
  browser refreshes the data.
- Data comes from `sports.core.api.espn.com` — the only ESPN API host
  that sends CORS headers. The friendlier `site.api.espn.com` /
  `site.web.api.espn.com` hosts return richer JSON but are blocked for
  cross-origin browser fetches, so they can't be used from a static
  page.
- `data/cities.js` is the single source of truth for cities and teams.
- Each team should pin its ESPN `teamId`. If it's missing, the id is
  resolved by name at runtime, but on the core API that costs one
  request per team in the league (the team list is just `$ref` links),
  so treat name resolution as a bootstrap convenience: load the page
  once, grab the resolved id from session storage or the network tab,
  and pin it.

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

## Known limitations / roadmap

- **Unofficial data source.** ESPN's endpoints are undocumented and
  could change without notice. If this project grows beyond a hobby
  site, plan to move to a supported source (e.g. TheSportsDB premium)
  behind a small caching layer.
- **Chatty API.** The core API returns event lists as `$ref` links, so
  each team card costs one list request, ~9 small event requests, and
  one broadcasts request per shown game (all in parallel). A
  caching/build layer would collapse this.
- **Client-side fetching** means every visitor hits ESPN directly. Fine
  at low traffic; at scale, switch to a scheduled build step that
  fetches once and serves cached static pages.
- Some leagues' schedule endpoints only return the current season
  segment — offseason teams correctly show an "Offseason" state.
- Not yet done: remaining metro areas (TV/broadcast info is in),
  ticket links, per-league filtering.

## Deploying

It's a static site — GitHub Pages, Netlify, Cloudflare Pages, or any
static host works as-is.
