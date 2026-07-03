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

  // ---------- team filter state ----------

  const HIDDEN_KEY = "balltown:hidden:" + citySlug;
  let hiddenKeys;
  try {
    hiddenKeys = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]"));
  } catch (e) {
    hiddenKeys = new Set();
  }
  let lastResults = [];

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

  // Broadcast channels: national feeds plus our side's regional feed.
  // The opponent's regional channel (market "Home"/"Away" on their
  // side) is skipped — it isn't watchable from this city anyway.
  async function fetchChannels(ev, game) {
    try {
      const comp = (ev.competitions && ev.competitions[0]) || {};
      if (!comp.broadcasts || !comp.broadcasts.$ref) return [];
      const data = await getJSON(comp.broadcasts.$ref);
      const ourMarket = game.home ? "Home" : "Away";
      // Opponent nickname, for catching mislabeled feeds (ESPN
      // sometimes tags the opponent's own stream with our market,
      // e.g. Padres.TV marked "Home" at Dodger Stadium).
      const oppWords = (game.opponent || "").toLowerCase().split(/\s+/);
      let oppNick = oppWords.pop() || "";
      if (oppNick === "fc") oppNick = oppWords.pop() || "";
      const names = [];
      (data.items || []).forEach((b) => {
        const market = b.market && b.market.type;
        const name = b.media && (b.media.shortName || b.media.name);
        if (!name) return;
        if (market && market !== "National" && market !== ourMarket) return;
        if (oppNick && name.toLowerCase().indexOf(oppNick) !== -1) return;
        if (names.indexOf(name) === -1) names.push(name);
      });
      return names;
    } catch (e) {
      return []; // channel info is nice-to-have; never fail the card
    }
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

    const upcoming = candidates
      .filter((ev) => {
        const d = new Date(ev.date);
        return !isNaN(d) && d > now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, GAMES_PER_TEAM);

    // Channels only for the games we'll actually show (one extra
    // request per game).
    return Promise.all(
      upcoming.map(async (ev) => {
        const game = toGame(ev, id, team);
        game.channels = await fetchChannels(ev, game);
        return game;
      })
    );
  }

  // ---------- formatting ----------

  // All times render in the VIEWER's local zone (no timeZone option),
  // not the city's — a fan checking from elsewhere sees their own
  // clock times.
  const fmtDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });
  const fmtTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit"
  });

  // Viewer's zone abbreviation ("CDT", "GMT+2", …) for the given
  // date, so DST changes stay accurate.
  function localTzLabel(d) {
    const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
      .formatToParts(d);
    const p = parts.find((x) => x.type === "timeZoneName");
    return p ? p.value : "";
  }

  // ---------- rendering ----------

  // Chip / up-next label: the config's `short`, falling back to the
  // full name for teams that haven't set one.
  function shortTeamName(team) {
    return team.short || team.name;
  }

  // Generic line icons per sport (keyed by the first segment of
  // sportPath). Decorative only — always emitted with aria-hidden.
  const SPORT_ICONS = {
    baseball:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M8 4.9c2.6 4.4 2.6 9.8 0 14.2M16 4.9c-2.6 4.4-2.6 9.8 0 14.2"/></svg>',
    basketball:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M3 12h18M12 3v18M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8"/></svg>',
    football:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
      '<ellipse cx="12" cy="12" rx="9.5" ry="5.5" transform="rotate(-45 12 12)"/>' +
      '<path d="M9 15l6-6M9.9 12.3l1.8 1.8M12.3 9.9l1.8 1.8"/></svg>',
    hockey:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
      '<ellipse cx="12" cy="8.5" rx="8" ry="3.5"/>' +
      '<path d="M4 8.5v6c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-6"/></svg>',
    soccer:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 8l3.4 2.5-1.3 4h-4.2l-1.3-4z"/>' +
      '<path d="M12 8V3.2M15.4 10.5l4.4-1.6M14.1 14.5l2.7 3.8M9.9 14.5l-2.7 3.8M8.6 10.5L4.2 8.9"/></svg>'
  };

  function sportIcon(team) {
    return SPORT_ICONS[team.sportPath.split("/")[0]] || "";
  }

  function gameRow(ev, team) {
    return (
      '<li class="game">' +
      '<span class="g-date">' + fmtDate.format(ev.date) + "</span>" +
      '<span class="g-opp"><span class="vs">' + (ev.home ? "vs" : "at") + "</span>" +
      ev.opponent +
      (ev.home ? '<span class="home-tag">Home</span>' : "") +
      (ev.channels && ev.channels.length
        ? '<span class="g-tv">' + ev.channels.join(", ") + "</span>"
        : "") +
      "</span>" +
      '<span class="g-time">' + fmtTime.format(ev.date) + "</span>" +
      "</li>"
    );
  }

  function teamCard(team, events, error) {
    const head =
      '<div class="team-head">' +
      '<span class="team-ic" aria-hidden="true">' + sportIcon(team) + "</span>" +
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
      '<section class="team' + extraClass + '" data-key="' + team.key +
      '" style="--t1:' + team.colors[0] +
      ";--t2:" + team.colors[1] + '">' + head + body + "</section>"
    );
  }

  function upNextCard(item) {
    return (
      '<div class="next-card" style="--tc:' + item.team.colors[0] + '">' +
      '<span class="next-ic" aria-hidden="true">' + sportIcon(item.team) + "</span>" +
      '<div class="next-when">' + fmtDate.format(item.ev.date) + "</div>" +
      '<div class="next-team">' + shortTeamName(item.team) + "</div>" +
      '<div class="next-opp">' + (item.ev.home ? "vs " : "at ") + item.ev.opponent +
      (item.ev.home ? " · home" : "") + "</div>" +
      (item.ev.channels && item.ev.channels.length
        ? '<div class="next-tv">' + item.ev.channels.join(", ") + "</div>"
        : "") +
      '<div class="next-time">' + fmtTime.format(item.ev.date) + " " + localTzLabel(item.ev.date) + "</div>" +
      "</div>"
    );
  }

  // ---------- team filter ----------

  function renderFilter() {
    const el = document.getElementById("team-filter");
    if (!el) return;
    el.innerHTML = city.teams
      .map(
        (t) =>
          '<button type="button" class="chip' +
          (hiddenKeys.has(t.key) ? " is-off" : "") +
          '" data-key="' + t.key +
          '" aria-pressed="' + !hiddenKeys.has(t.key) +
          '" style="--tc:' + t.colors[0] + '">' +
          (sportIcon(t)
            ? '<span class="chip-ic" aria-hidden="true">' + sportIcon(t) + "</span>"
            : '<span class="chip-dot"></span>') +
          shortTeamName(t) + "</button>"
      )
      .join("");
    el.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const key = btn.dataset.key;
      if (hiddenKeys.has(key)) hiddenKeys.delete(key);
      else hiddenKeys.add(key);
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(hiddenKeys)));
      applyFilter();
    });
  }

  function applyFilter() {
    document.querySelectorAll("#team-filter .chip").forEach((btn) => {
      const off = hiddenKeys.has(btn.dataset.key);
      btn.classList.toggle("is-off", off);
      btn.setAttribute("aria-pressed", String(!off));
    });
    document.querySelectorAll("#teams .team[data-key]").forEach((sec) => {
      sec.classList.toggle("filtered", hiddenKeys.has(sec.dataset.key));
    });
    renderStrip();
  }

  function renderStrip() {
    const stripEl = document.getElementById("upnext-strip");
    if (!lastResults.length) return; // still loading
    const all = [];
    lastResults.forEach((r) => {
      if (hiddenKeys.has(r.team.key)) return;
      r.events.forEach((ev) => all.push({ team: r.team, ev }));
    });
    all.sort((a, b) => a.ev.date - b.ev.date);
    stripEl.innerHTML = all.length
      ? all.slice(0, UP_NEXT_COUNT).map(upNextCard).join("")
      : '<p class="strip-empty">All teams are hidden — tap a team above to bring them back.</p>';
  }

  // ---------- boot ----------

  async function main() {
    document.querySelectorAll("[data-city-name]").forEach((el) => {
      el.textContent = city.name;
    });
    document.title = city.name + " · ball.town";

    renderFilter();

    const teamsEl = document.getElementById("teams");
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

    // up-next strip + grayed-out cards for filtered teams
    lastResults = results;
    applyFilter();

    const stamp = document.getElementById("updated");
    if (stamp) {
      const now = new Date();
      stamp.textContent =
        "Live data · loaded " +
        new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
        }).format(now) + " " + localTzLabel(now) + " · refresh for latest";
    }
  }

  main();
})();
