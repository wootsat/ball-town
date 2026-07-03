# ball.town

Every pro team in your city, one page. Live schedules for NFL, NBA, MLB,
NHL, MLS, and WNBA teams, grouped by metro area.

## How it works

- Plain static site — no build step, no framework, no API key.
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

1. Add an entry to `data/cities.js` (copy the Minneapolis block; the key
   is the URL slug). Pin each team's ESPN `teamId` — leave it off for
   the first load and the app resolves it from the `match` name, then
   pin the id it found.
2. Copy `city/minneapolis.html` to `city/<slug>.html` and change
   `data-city="<slug>"` on the `<body>` tag (and the fallback text in
   `<h1>`/`<title>`).
3. Add a card for it in `index.html`.

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
  each team card costs one list request plus ~9 small event requests
  (they run in parallel). A caching/build layer would collapse this.
- **Client-side fetching** means every visitor hits ESPN directly. Fine
  at low traffic; at scale, switch to a scheduled build step that
  fetches once and serves cached static pages.
- Some leagues' schedule endpoints only return the current season
  segment — offseason teams correctly show an "Offseason" state.
- Not yet done: remaining ~30 city pages, TV/broadcast info, ticket
  links, per-league filtering, generating city pages from the config
  instead of hand-copying HTML shells.

## Deploying

It's a static site — GitHub Pages, Netlify, Cloudflare Pages, or any
static host works as-is.
