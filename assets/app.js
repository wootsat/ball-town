// ============================================================
// ball.town — live schedule loader
// Fetches upcoming games from ESPN's public (unofficial) API
// on every page load. Refresh the browser = fresh data.
// ============================================================

(function () {
  const API = "https://site.api.espn.com/apis/site/v2/sports";
  const GAMES_PER_TEAM = 7;
  const UP_NEXT_COUNT = 5;

  const citySlug = document.body.dataset.city;
  const city = window.BALLTOWN.cities[citySlug];
  if (!city) {
    document.getElementById("teams").innerHTML =
      "<p class='load-error'>Unknown city: " + citySlug + "</p>";
    return;
  }

  // ---------- data fetching ----------

  async function getJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
  }

  // Find the team's ESPN id by name match (cached per session so
  // six teams don't mean six league-roster downloads on every visit).
  async function resolveTeamId(team) {
    if (team.teamId) return team.teamId;
    const cacheKey = "balltown:id:" + team.sportPath + ":" + team.match;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;

    const data = await getJSON(API + "/" + team.sportPath + "/teams?limit=400");
    const teams = data.sports[0].leagues[0].teams.map((t) => t.team);
    const needle = team.match.toLowerCase();
    const hit = teams.find(
      (t) =>
        (t.displayName || "").toLowerCase().includes(needle) ||
        (t.shortDisplayName || "").toLowerCase().includes(needle)
    );
    if (!hit) throw new Error("No ESPN team matching '" + team.match + "'");
    sessionStorage.setItem(cacheKey, hit.id);
    return hit.id;
  }

  async function fetchUpcoming(team) {
    const id = await resolveTeamId(team);
    const data = await getJSON(
      API + "/" + team.sportPath + "/teams/" + id + "/schedule"
    );
    const now = new Date();
    const events = (data.events || [])
      .map((e) => {
        const comp = (e.competitions && e.competitions[0]) || {};
        const sides = comp.competitors || [];
        const us = sides.find((c) => String(c.team && c.team.id) === String(id));
        const them = sides.find((c) => c !== us);
        return {
          date: new Date(e.date),
          home: !!(us && us.homeAway === "home"),
          opponent:
            (them && them.team && (them.team.displayName || them.team.name)) ||
            e.name ||
            "TBD",
          label: e.seasonType && e.seasonType.name === "Preseason" ? "Preseason" : null
        };
      })
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
