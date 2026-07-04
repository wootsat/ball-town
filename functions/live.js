// Cloudflare Pages Function → served at /live.
// Polls ESPN's per-league scoreboards, returns a compact map of the
// IN-PROGRESS games keyed by "<sportPath>:<teamId>" (both sides), and
// edge-caches the response for 30s. So ESPN is hit at most ~once per
// 30s per edge location no matter how many visitors poll — the browser
// reads this one cached endpoint, never ESPN directly.

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
      });
    } catch (e) { /* skip this league on error */ }
  }));
  return { generated: new Date().toISOString(), games: games };
}

export async function onRequest(context) {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/__live", context.request.url).toString());
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
