// ============================================================
// ball.town — live schedule loader
// Fetches upcoming games from ESPN's public (unofficial) API
// on every page load. Refresh the browser = fresh data.
//
// Uses sports.core.api.espn.com — the only ESPN API host that
// sends CORS headers, so it's the only one browsers can call
// directly (site.api.espn.com / site.web.api.espn.com are
// blocked for cross-origin pages).
// ============================================================

(function () {
  const API = "https://sports.core.api.espn.com/v2/sports";
  const GAMES_PER_TEAM = 7;
  const UP_NEXT_COUNT = 5;
  // How far ahead to look for games. Wide enough to bridge any
  // offseason gap (NFL's Feb–Aug is the longest).
  const WINDOW_DAYS = 240;
  // Extra events fetched beyond GAMES_PER_TEAM so games earlier
  // today (already started, filtered out below) don't leave gaps.
  const FETCH_MARGIN = 2;

  const citySlug = document.body.dataset.city;
  const city = window.BALLTOWN.cities[citySlug];
  if (!city) {
    document.getElementById("teams").innerHTML =
      "<p class='load-error'>Unknown city: " + citySlug + "</p>";
    return;
  }

  // ---------- data fetching ----------

  async function getJSON(url) {
    // $ref links come back as http:// — upgrade so the site also
    // works when served over https.
    const res = await fetch(url.replace(/^http:/, "https:"));
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
  }

  // "baseball/mlb" (config) -> "baseball/leagues/mlb" (core API path)
  function leaguePath(sportPath) {
    const parts = sportPath.split("/");
    return parts[0] + "/leagues/" + parts[1];
  }

  function yyyymmdd(d) {
    return d.toISOString().slice(0, 10).replace(/-/g, "");
  }

  // Find the team's ESPN id by name match (cached per session).
  // The core API's team list is just $ref links, so this costs one
  // request per team in the league — prefer pinning teamId in
  // data/cities.js and keeping this as a fallback.
  async function resolveTeamId(team) {
    if (team.teamId) return String(team.teamId);
    const cacheKey = "balltown:id:" + team.sportPath + ":" + team.match;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;

    const list = await getJSON(
      API + "/" + leaguePath(team.sportPath) + "/teams?limit=400"
    );
    const teams = await Promise.all(
      (list.items || []).map((item) => getJSON(item.$ref))
    );
    const needle = team.match.toLowerCase();
    const hit = teams.find(
      (t) =>
        (t.displayName || "").toLowerCase().includes(needle) ||
        (t.shortDisplayName || "").toLowerCase().includes(needle)
    );
    if (!hit) throw new Error("No ESPN team matching '" + team.match + "'");
    sessionStorage.setItem(cacheKey, String(hit.id));
    return String(hit.id);
  }

  function toGame(ev, id, team) {
    const comp = (ev.competitions && ev.competitions[0]) || {};
    const sides = comp.competitors || [];
    const us = sides.find((c) => String(c.id) === String(id));
    const home = !!(us && us.homeAway === "home");

    // Event names are "Away Team at Home Team" in every league.
    let opponent = null;
    if (ev.name && ev.name.indexOf(" at ") !== -1) {
      const halves = ev.name.split(" at ");
      opponent = home ? halves[0] : halves[1];
    }

    // seasonType is a $ref like .../types/1. Type 1 is Preseason in
    // the US leagues but Regular Season in soccer, so skip soccer.
    const typeRef = (ev.seasonType && ev.seasonType.$ref) || "";
    const preseason =
      team.sportPath.indexOf("soccer/") !== 0 && /\/types\/1(\?|$)/.test(typeRef);

    return {
      date: new Date(ev.date),
      home: home,
      opponent: opponent || ev.shortName || "TBD",
      label: preseason ? "Preseason" : null
    };
  }

  async function fetchUpcoming(team) {
    const id = await resolveTeamId(team);
    const now = new Date();
    // Start the window a day early: `dates` is interpreted in UTC,
    // and tonight's game can be "tomorrow" UTC (and vice versa).
    const start = new Date(now.getTime() - 86400000);
    const end = new Date(now.getTime() + WINDOW_DAYS * 86400000);
    const list = await getJSON(
      API + "/" + leaguePath(team.sportPath) + "/teams/" + id +
      "/events?dates=" + yyyymmdd(start) + "-" + yyyymmdd(end) + "&limit=500"
    );
    const refs = (list.items || []).map((item) => item.$ref);
    if (!refs.length) return [];

    // The list is date-sorted, but the direction varies by league
    // (MLB ascending, soccer descending, …). Probe both ends, then
    // fetch only the earliest handful.
    const take = GAMES_PER_TEAM + FETCH_MARGIN;
    const first = await getJSON(refs[0]);
    let candidates;
    if (refs.length <= take) {
      candidates = [first].concat(
        await Promise.all(refs.slice(1).map(getJSON))
      );
    } else {
      const last = await getJSON(refs[refs.length - 1]);
      const ascending = new Date(first.date) <= new Date(last.date);
      const slice = ascending ? refs.slice(1, take) : refs.slice(-take, -1);
      const rest = await Promise.all(slice.map(getJSON));
      candidates = ascending ? [first].concat(rest) : rest.concat([last]);
    }

    const events = candidates
      .map((ev) => toGame(ev, id, team))
      .filter((ev) => !isNaN(ev.date) && ev.date > now)
      .sort((a, b) => a.date - b.date);
    return events.slice(0, GAMES_PER_TEAM);
  }

  // ---------- formatting ----------

  const fmtDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: city.tz
  });
  const fmtTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", timeZone: city.tz
  });

  // ---------- rendering ----------

  function gameRow(ev, team) {
    return (
      '<li class="game">' +
      '<span class="g-date">' + fmtDate.format(ev.date) + "</span>" +
      '<span class="g-opp"><span class="vs">' + (ev.home ? "vs" : "at") + "</span>" +
      ev.opponent +
      (ev.home ? '<span class="home-tag">Home</span>' : "") +
      "</span>" +
      '<span class="g-time">' + fmtTime.format(ev.date) + "</span>" +
      "</li>"
    );
  }

  function teamCard(team, events, error) {
    const head =
      '<div class="team-head">' +
      '<div class="team-league">' + team.leagueLabel + "</div>" +
      '<div class="team-name">' + team.name + "</div>" +
      '<div class="team-venue">' + team.venue + "</div>" +
      "</div>";

    let body, extraClass = "";
    if (error) {
      extraClass = " off";
      body =
        '<div class="off-body"><span class="off-pill">Unavailable</span>' +
        "<p>Couldn't load this schedule right now. Refresh the page to try again.</p></div>";
    } else if (!events.length) {
      extraClass = " off";
      body =
        '<div class="off-body"><span class="off-pill">Offseason</span>' +
        "<p>No upcoming games posted. Games will appear here as soon as the league releases the schedule.</p></div>";
    } else {
      body = '<ul class="games">' + events.map((e) => gameRow(e, team)).join("") + "</ul>";
    }

    return (
      '<section class="team' + extraClass + '" style="--t1:' + team.colors[0] +
      ";--t2:" + team.colors[1] + '">' + head + body + "</section>"
    );
  }

  function upNextCard(item) {
    return (
      '<div class="next-card" style="--tc:' + item.team.colors[0] + '">' +
      '<div class="next-when">' + fmtDate.format(item.ev.date) + "</div>" +
      '<div class="next-team">' + item.team.name.replace("Minnesota ", "").replace(" FC", "") + "</div>" +
      '<div class="next-opp">' + (item.ev.home ? "vs " : "at ") + item.ev.opponent +
      (item.ev.home ? " · home" : "") + "</div>" +
      '<div class="next-time">' + fmtTime.format(item.ev.date) + " " + city.tzLabel + "</div>" +
      "</div>"
    );
  }

  // ---------- boot ----------

  async function main() {
    document.querySelectorAll("[data-city-name]").forEach((el) => {
      el.textContent = city.name;
    });
    document.title = city.name + " · ball.town";

    const teamsEl = document.getElementById("teams");
    const stripEl = document.getElementById("upnext-strip");
    teamsEl.innerHTML = '<p class="loading">Loading schedules…</p>';

    const results = await Promise.all(
      city.teams.map(async (team) => {
        try {
          return { team, events: await fetchUpcoming(team), error: null };
        } catch (err) {
          console.error(team.name, err);
          return { team, events: [], error: err };
        }
      })
    );

    // team cards: in-season teams first, offseason/error last
    const sorted = results.slice().sort(
      (a, b) => (b.events.length ? 1 : 0) - (a.events.length ? 1 : 0)
    );
    teamsEl.innerHTML = sorted.map((r) => teamCard(r.team, r.events, r.error)).join("");

    // up-next strip: earliest games across all teams
    const all = [];
    results.forEach((r) =>
      r.events.forEach((ev) => all.push({ team: r.team, ev }))
    );
    all.sort((a, b) => a.ev.date - b.ev.date);
    stripEl.innerHTML = all.slice(0, UP_NEXT_COUNT).map(upNextCard).join("");

    const stamp = document.getElementById("updated");
    if (stamp) {
      stamp.textContent =
        "Live data · loaded " +
        new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", hour: "numeric",
          minute: "2-digit", timeZone: city.tz
        }).format(new Date()) + " " + city.tzLabel + " · refresh for latest";
    }
  }

  main();
})();
