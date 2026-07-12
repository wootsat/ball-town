// ball.town daily schedule fetcher.
// Precomputes, once per day, exactly what the client used to fetch live
// per visit — and writes it to a static data/schedules.json. The browser
// then reads that one file instead of calling ESPN, so ESPN load is
// decoupled from user count (this is what lets the site scale).
//
// It deliberately uses the SAME core-API path the browser used, so the
// cached output matches the old live behavior league-for-league. See
// CLAUDE.md "ESPN API" for why the core API (not the richer site.api
// /schedule endpoint) is the source of truth — the latter drops
// preseason / next-season games inconsistently across leagues.
//
// Run:  node tools/fetch-schedules.mjs   (or: npm run fetch)
// Runs daily in CI (.github/workflows/refresh.yml).

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { cities } = require(join(root, "data", "cities.js"));

const API = "https://sports.core.api.espn.com/v2/sports";
const GAMES_PER_TEAM = 7;
const FETCH_MARGIN = 2;
const WINDOW_DAYS = 240;
const TEAM_CONCURRENCY = 4; // gentle on ESPN; daily job, no rush

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 3) {
  const u = url.replace(/^http:/, "https:");
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(u);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      if (i >= tries) throw new Error(e.message + " for " + u);
      await sleep(400 * i); // backoff before retry
    }
  }
}

function leaguePath(sportPath) {
  const p = sportPath.split("/");
  return p[0] + "/leagues/" + p[1];
}
function yyyymmdd(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function toGame(ev, id, team) {
  const comp = (ev.competitions && ev.competitions[0]) || {};
  const sides = comp.competitors || [];
  const us = sides.find((c) => String(c.id) === String(id));
  const home = !!(us && us.homeAway === "home");
  let opponent = null;
  if (ev.name && ev.name.indexOf(" at ") !== -1) {
    const halves = ev.name.split(" at ");
    opponent = home ? halves[0] : halves[1];
  }
  const typeRef = (ev.seasonType && ev.seasonType.$ref) || "";
  const preseason =
    team.sportPath.indexOf("soccer/") !== 0 && /\/types\/1(\?|$)/.test(typeRef);
  return {
    date: new Date(ev.date),
    home: home,
    opponent: opponent || ev.shortName || "TBD",
    label: preseason ? "Preseason" : null,
    // internal (not written to JSON): used by channelsFor's national rule.
    sportPath: team.sportPath,
    postseason: /\/types\/3(\?|$)/.test(typeRef) // ESPN type 3 = playoffs
  };
}

async function channelsFor(ev, game) {
  try {
    const comp = (ev.competitions && ev.competitions[0]) || {};
    if (!comp.broadcasts || !comp.broadcasts.$ref) return { names: [], national: false };
    const data = await getJSON(comp.broadcasts.$ref);
    const ourMarket = game.home ? "Home" : "Away";
    const words = (game.opponent || "").toLowerCase().split(/\s+/);
    let oppNick = words.pop() || "";
    if (oppNick === "fc") oppNick = words.pop() || "";
    // NFL only: Fox & CBS carry regional Sunday-afternoon windows (you get
    // your market's game, not "the" national game), so they DON'T earn the
    // Nat'l TV tag in the regular/pre-season — only NBC, ABC, ESPN do. In
    // the PLAYOFFS every network's game is national, so the normal rule
    // applies (Fox/CBS included).
    const isNFL = game.sportPath === "football/nfl";
    const NFL_NATIONAL = /\b(?:NBC|ABC|ESPN)\b/i;
    // "Nat'l Stream" = a national direct-to-consumer streamer that carries
    // the game for any basic subscriber (no sports upsell). We match the
    // streamer name AND require market:National — that's what separates the
    // included national feeds (NFL Prime Video, MLB Apple TV+/Peacock, all
    // market:National) from the upsell/regional look-alikes: MLS "Apple TV"
    // (Season Pass) has NO market, "Prime Video-Seattle" is regional (Home),
    // and MLB.TV / League Pass / ESPN+ / vMVPDs (YouTube TV, Fubo) never
    // match the name.
    const NATL_STREAMERS = /peacock|prime video|amazon prime|paramount\+|disney\+|apple tv/i;
    const names = [];
    let national = false;
    let natStream = false;
    (data.items || []).forEach((b) => {
      const market = b.market && b.market.type;
      const type = b.type && b.type.shortName;
      const name = b.media && (b.media.shortName || b.media.name);
      if (!name) return;
      // "National TV" = a national-market TV broadcast (ESPN, FOX, NBC,
      // MLB Net…). Excludes the always-on league streaming packages
      // (MLB.TV, League Pass = type "Streaming") and radio.
      if (market === "National" && type === "TV") {
        if (isNFL && !game.postseason) {
          if (NFL_NATIONAL.test(name)) national = true;
        } else {
          national = true;
        }
      }
      if (market === "National" && NATL_STREAMERS.test(name)) natStream = true;
      if (market && market !== "National" && market !== ourMarket) return;
      if (oppNick && name.toLowerCase().indexOf(oppNick) !== -1) return;
      if (names.indexOf(name) === -1) names.push(name);
    });
    return { names: names, national: national, natStream: natStream };
  } catch (e) {
    return { names: [], national: false, natStream: false };
  }
}

async function fetchUpcoming(team) {
  const id = String(team.teamId);
  const now = new Date();
  const start = new Date(now.getTime() - 86400000);
  const end = new Date(now.getTime() + WINDOW_DAYS * 86400000);
  const list = await getJSON(
    API + "/" + leaguePath(team.sportPath) + "/teams/" + id +
    "/events?dates=" + yyyymmdd(start) + "-" + yyyymmdd(end) + "&limit=500"
  );
  const refs = (list.items || []).map((item) => item.$ref);
  if (!refs.length) return [];

  const take = GAMES_PER_TEAM + FETCH_MARGIN;
  const first = await getJSON(refs[0]);
  let candidates;
  if (refs.length <= take) {
    candidates = [first].concat(await Promise.all(refs.slice(1).map((r) => getJSON(r))));
  } else {
    const last = await getJSON(refs[refs.length - 1]);
    const ascending = new Date(first.date) <= new Date(last.date);
    const slice = ascending ? refs.slice(1, take) : refs.slice(-take, -1);
    const rest = await Promise.all(slice.map((r) => getJSON(r)));
    candidates = ascending ? [first].concat(rest) : rest.concat([last]);
  }

  const upcoming = candidates
    .filter((ev) => {
      const d = new Date(ev.date);
      return !isNaN(d) && d > now;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, GAMES_PER_TEAM);

  return Promise.all(
    upcoming.map(async (ev) => {
      const game = toGame(ev, id, team);
      const bc = await channelsFor(ev, game);
      const out = { date: game.date.toISOString(), home: game.home, opponent: game.opponent };
      if (game.label) out.label = game.label;
      if (bc.names.length) out.channels = bc.names;
      if (bc.national) out.national = true;
      if (bc.natStream) out.natStream = true;
      return out;
    })
  );
}

// ---- run over every team, with a small concurrency pool ----
const jobs = [];
for (const [, city] of Object.entries(cities)) {
  for (const team of city.teams) jobs.push(team);
}

const out = { generated: new Date().toISOString(), teams: {} };
let ok = 0, failed = 0, cursor = 0;
async function worker() {
  while (cursor < jobs.length) {
    const team = jobs[cursor++];
    const key = team.sportPath + ":" + team.teamId;
    try {
      out.teams[key] = await fetchUpcoming(team);
      ok++;
    } catch (e) {
      out.teams[key] = [];
      failed++;
      console.log("  !! " + key + " (" + team.name + "): " + e.message);
    }
  }
}
await Promise.all(Array.from({ length: TEAM_CONCURRENCY }, worker));

if (failed > jobs.length / 4) {
  // Too many failures — don't overwrite a good cache with a broken one.
  console.error("Aborting: " + failed + "/" + jobs.length + " teams failed.");
  process.exit(1);
}

writeFileSync(join(root, "data", "schedules.json"), JSON.stringify(out));
const games = Object.values(out.teams).reduce((n, a) => n + a.length, 0);
console.log(
  "Wrote data/schedules.json — " + Object.keys(out.teams).length +
  " teams (" + ok + " ok, " + failed + " failed), " + games + " games total."
);
