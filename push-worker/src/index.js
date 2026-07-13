// ball.town push sender — a Cloudflare Worker on a 5-minute cron. Reads the
// public schedule cache, matches upcoming games to each subscriber's prefs,
// and sends web-push notifications. Free-tier friendly: no Durable Objects,
// no Queues. Dedup + send caps keep it inside the free limits.
import { sendPush } from "./webpush.js";

const SCHEDULES_URL = "https://ball.town/data/schedules.json";
const MORNING_HOUR = 8;        // local hour to send the game-day heads-up
const PRE_LOW_MIN = 8;         // "10 minutes before" fires in the 8–13 min
const PRE_HIGH_MIN = 13;       //   window (cron runs every 5 min)
const MAX_SENDS_PER_RUN = 45;  // free-plan subrequest budget is 50/invocation

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env, Date.now()));
  }
};

// Local calendar day (YYYY-MM-DD) and hour for a timestamp in an IANA tz.
function localParts(ts, tz) {
  try {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false
    }).formatToParts(new Date(ts));
    const g = (t) => (p.find((x) => x.type === t) || {}).value;
    return { date: g("year") + "-" + g("month") + "-" + g("day"), hour: parseInt(g("hour"), 10) };
  } catch (e) {
    return { date: new Date(ts).toISOString().slice(0, 10), hour: new Date(ts).getUTCHours() };
  }
}

function preMsg(pref, g) {
  return {
    title: pref.short + " starts soon",
    body: (g.home ? "vs " : "at ") + g.opponent + " · about 10 minutes to kickoff",
    tag: "pre:" + pref.short + ":" + g.date,
    url: pref.code ? "/" + pref.code : "/"
  };
}
function morningMsg(shorts, code) {
  const list = shorts.join(", ");
  return {
    title: "Game day: " + list,
    body: shorts.length > 1 ? "Your teams play today — tap for times and channels."
                            : list + " plays today — tap for the time and channel.",
    tag: "morning",
    url: code ? "/" + code : "/"
  };
}

async function run(env, now) {
  const vapid = {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT || "mailto:hello@ball.town"
  };
  let teams = {};
  try {
    const res = await fetch(SCHEDULES_URL, { cf: { cacheTtl: 120, cacheEverything: true } });
    teams = (await res.json()).teams || {};
  } catch (e) {
    return; // schedule unavailable this run — skip
  }

  const rows = (await env.DB.prepare("SELECT * FROM subscriptions").all()).results || [];
  const queue = [];
  for (const sub of rows) {
    let prefs = {};
    try { prefs = JSON.parse(sub.prefs) || {}; } catch (e) { prefs = {}; }
    const ids = Object.keys(prefs);
    if (!ids.length) continue;

    // ---- 10-minutes-before (per game) ----
    for (const id of ids) {
      if (!prefs[id] || !prefs[id].pre) continue;
      for (const g of teams[id] || []) {
        const mins = (Date.parse(g.date) - now) / 60000;
        if (mins >= PRE_LOW_MIN && mins <= PRE_HIGH_MIN) {
          queue.push({ sub, id: sub.endpoint + "|pre|" + id + "|" + g.date, msg: preMsg(prefs[id], g) });
        }
      }
    }

    // ---- morning-of game day (one aggregated alert per day) ----
    if (ids.some((id) => prefs[id] && prefs[id].morning)) {
      const local = localParts(now, sub.tz || "UTC");
      if (local.hour === MORNING_HOUR) {
        const shorts = [];
        let code = null;
        for (const id of ids) {
          if (!prefs[id] || !prefs[id].morning) continue;
          const plays = (teams[id] || []).some((g) => localParts(Date.parse(g.date), sub.tz || "UTC").date === local.date);
          if (plays) { shorts.push(prefs[id].short); code = code || prefs[id].code; }
        }
        if (shorts.length) {
          queue.push({ sub, id: sub.endpoint + "|morning|" + local.date, msg: morningMsg(shorts, code) });
        }
      }
    }
  }

  let sent = 0;
  for (const item of queue) {
    if (sent >= MAX_SENDS_PER_RUN) break;
    const dup = await env.DB.prepare("SELECT 1 FROM sent WHERE id = ?").bind(item.id).first();
    if (dup) continue;
    try {
      const res = await sendPush(item.sub, JSON.stringify(item.msg), vapid);
      if (res.status === 404 || res.status === 410) {
        await env.DB.prepare("DELETE FROM subscriptions WHERE endpoint = ?").bind(item.sub.endpoint).run();
      }
    } catch (e) {
      /* transient send failure — the dedup row below still records the attempt */
    }
    await env.DB.prepare("INSERT OR IGNORE INTO sent (id, ts) VALUES (?, ?)").bind(item.id, now).run();
    sent++;
  }

  // prune dedup rows older than 2 days
  await env.DB.prepare("DELETE FROM sent WHERE ts < ?").bind(now - 2 * 86400000).run();
}
