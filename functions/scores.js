// Cloudflare Pages Function → served at /scores.
// Polls ESPN's per-league scoreboards and returns, edge-cached 30s:
//   games : { "<sportPath>:<teamId>": {date,home,opponent,us,them,status,state} }
//           — both sides of every in-progress/finished game; what the city
//             pages poll to overlay live/final scores.
//   live  : [ {sport,home,away,homeScore,awayScore,status,homeColor} ]
//           — one entry per IN-PROGRESS game, for the /live "Live Now" page
//             and the home-page "see all live games" indicator.
// (Was /live; renamed so the /live URL can serve the Live Now page.)

const BASE = "https://site.api.espn.com/apis/site/v2/sports";
const LEAGUES = [
  "baseball/mlb", "basketball/wnba", "basketball/nba",
  "football/nfl", "hockey/nhl", "soccer/usa.1"
];
const TTL = 30; // seconds

// Compact per-sport status ("Bot 7", "3Q 3:46", "2nd 5:12", "72'"),
// falling back to ESPN's own text for stoppages (delay, halftime, …).
function liveStatus(lg, status) {
  const t = status.type || {};
  const sport = lg.split("/")[0];
  const clock = status.displayClock;
  const period = status.period;
  const sd = t.shortDetail || t.description || "LIVE";
  const nm = t.name || "";
  if (/HALFTIME/.test(nm)) return "Half";
  if (/DELAY/.test(nm)) return sd;
  if (sport === "baseball") {
    const half = /top/i.test(sd) ? "Top" : /bottom|bot/i.test(sd) ? "Bot"
      : /mid/i.test(sd) ? "Mid" : /end/i.test(sd) ? "End" : null;
    return half && period ? half + " " + period : sd;
  }
  if (sport === "soccer") return clock || sd;
  if (sport === "hockey") {
    const p = period <= 3 ? ["", "1st", "2nd", "3rd"][period] : (period === 4 ? "OT" : "SO");
    return clock && clock !== "0:00" ? p + " " + clock : p;
  }
  if (period) { // basketball, football
    const q = period <= 4 ? period + "Q" : (period === 5 ? "OT" : (period - 4) + "OT");
    return clock && clock !== "0.0" ? q + " " + clock : q;
  }
  return sd;
}

async function buildLive() {
  const games = {};
  const live = [];
  await Promise.all(LEAGUES.map(async (lg) => {
    try {
      const res = await fetch(BASE + "/" + lg + "/scoreboard");
      if (!res.ok) return;
      const j = await res.json();
      (j.events || []).forEach((ev) => {
        const st = ev.status && ev.status.type;
        // in-progress ("in") or finished ("post"). "post" games stay on
        // ESPN's scoreboard through the day; the client drops them once
        // the viewer's local date rolls over.
        if (!st || (st.state !== "in" && st.state !== "post")) return;
        const comp = ev.competitions && ev.competitions[0];
        if (!comp) return;
        const final = st.state === "post";
        const status = final
          ? (st.shortDetail || "Final")   // "Final", "Final/OT", "Final/10"
          : liveStatus(lg, ev.status);
        const cs = comp.competitors || [];
        cs.forEach((c) => {
          const other = cs.find((x) => x !== c);
          if (!other) return;
          // Opponent from "Away at Home" (matches schedules.json naming).
          let opponent = "";
          if (ev.name && ev.name.indexOf(" at ") !== -1) {
            const h = ev.name.split(" at ");
            opponent = c.homeAway === "home" ? h[0] : h[1];
          }
          games[lg + ":" + c.id] = {
            date: ev.date,
            home: c.homeAway === "home",
            opponent: opponent,
            us: Number(c.score),
            them: Number(other.score),
            status: status,
            state: final ? "final" : "in"
          };
        });
        // one deduped entry per in-progress game for the Live Now page
        if (!final) {
          const home = cs.find((c) => c.homeAway === "home");
          const away = cs.find((c) => c.homeAway === "away");
          if (home && away) {
            const parts = (ev.name || "").split(" at "); // [away, home]
            const nameOf = (comp0, fallback) =>
              (comp0.team && (comp0.team.displayName || comp0.team.shortDisplayName)) || fallback || "";
            live.push({
              sport: lg.split("/")[0],
              away: nameOf(away, parts[0]),
              home: nameOf(home, parts[1]),
              awayScore: Number(away.score),
              homeScore: Number(home.score),
              status: status,
              homeColor: home.team && home.team.color ? "#" + home.team.color : null
            });
          }
        }
      });
    } catch (e) { /* skip this league on error */ }
  }));
  live.sort((a, b) => a.sport.localeCompare(b.sport) || a.home.localeCompare(b.home));
  return { generated: new Date().toISOString(), games: games, live: live };
}

export async function onRequest(context) {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/__scores", context.request.url).toString());
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const data = await buildLive();
  const resp = new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json;charset=utf-8",
      "cache-control": "public, max-age=" + TTL
    }
  });
  context.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}
