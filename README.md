# ball.town

Every pro team in your city, one page. Live schedules for NFL, NBA, MLB,
NHL, MLS, and WNBA teams, grouped by metro area.

## How it works

- Plain static site — no build step, no framework, no API key.
- Each city page fetches upcoming schedules **live in the browser** from
  ESPN's public (unofficial) API on every page load. Refreshing the
  browser refreshes the data.
- `data/cities.js` is the single source of truth for cities and teams.
- Team IDs are resolved automatically by name, so adding a team only
  requires its league path and name.

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
   is the URL slug).
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
