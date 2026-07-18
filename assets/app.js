// ============================================================
// ball.town — schedule renderer
// Reads a daily-refreshed static cache (data/schedules.json, built by
// tools/fetch-schedules.mjs) and renders it. No live ESPN calls from
// the browser — one small same-origin fetch per page load — so ESPN
// load is decoupled from visitor count.
// ============================================================

(function () {
  const UP_NEXT_COUNT = 5;
  // Bump on each deploy you want to confirm reached clients. It's baked
  // into this file, so the footer shows the version of the code ACTUALLY
  // running — the reliable "did my update land?" signal (a server-fetched
  // timestamp would read fresh even while a stale PWA runs old code).
  const APP_VERSION = "2026-07-11.16";
  // The daily static cache the browser reads instead of calling ESPN.
  const SCHEDULES_URL = "../data/schedules.json";
  // In-progress scores from the /scores Pages Function (edge-cached ~30s).
  const LIVE_URL = "../scores";
  const LIVE_POLL_MS = 30000;

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
  let scheduleData = null; // the loaded schedules.json, for on-demand adds

  // ---------- custom teams (user-added, saved per city) ----------
  // Every team across all cities is already in the daily cache
  // (schedules.json is keyed by "<sportPath>:<teamId>"), so "add any pro
  // team" just means surfacing a team the config already knows — no live
  // ESPN call. The user's picks are saved locally, per city.

  const ADDED_KEY = "balltown:added:" + citySlug;
  const idOf = (t) => t.sportPath + ":" + t.teamId;

  // Flat registry of every team in the config, keyed by id and tagged
  // with its home-city name (shown in the search list).
  const REGISTRY = {};
  Object.keys(window.BALLTOWN.cities).forEach((slug) => {
    const c = window.BALLTOWN.cities[slug];
    c.teams.forEach((t) => {
      const id = idOf(t);
      if (!REGISTRY[id]) REGISTRY[id] = { team: t, cityName: c.name };
    });
  });

  let addedIds;
  try {
    addedIds = JSON.parse(localStorage.getItem(ADDED_KEY) || "[]");
  } catch (e) {
    addedIds = [];
  }
  function saveAddedIds() {
    try {
      localStorage.setItem(ADDED_KEY, JSON.stringify(addedIds));
    } catch (e) {
      /* private mode — just skip persistence */
    }
  }

  // Base city teams + user-added teams, deduped by id. Added teams are
  // cloned with key = their global id so their chip/card data-key can
  // never collide with a base team's (plain) key.
  function activeTeams() {
    const seen = {};
    const out = [];
    city.teams.forEach((t) => {
      const id = idOf(t);
      if (seen[id]) return;
      seen[id] = true;
      out.push(t);
    });
    addedIds.forEach((id) => {
      if (seen[id]) return;
      const reg = REGISTRY[id];
      if (!reg) return;
      seen[id] = true;
      out.push(Object.assign({}, reg.team, { key: id, added: true }));
    });
    return out;
  }

  // ---------- custom card order (drag-to-reorder, saved per city) ----------
  // A saved array of team keys. When present it overrides the default
  // "in-season first" card sort; both the chips and the cards follow it.
  const ORDER_KEY = "balltown:order:" + citySlug;
  function loadOrder() {
    try {
      return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveOrder(order) {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch (e) {
      /* private mode */
    }
  }
  // Stable-sort a list by the saved order; items with no saved position
  // keep their natural order at the end. No-op when nothing is saved.
  function applyOrder(list, keyFn) {
    const order = loadOrder();
    if (!order.length) return list;
    const idx = {};
    order.forEach((k, i) => (idx[k] = i));
    const at = (o) =>
      Object.prototype.hasOwnProperty.call(idx, keyFn(o)) ? idx[keyFn(o)] : Infinity;
    return list.slice().sort((a, b) => at(a) - at(b));
  }
  function orderedActiveTeams() {
    return applyOrder(activeTeams(), (t) => t.key);
  }

  // Whether the whole team-chip row is collapsed (saved per city).
  const COLLAPSE_KEY = "balltown:chips-collapsed:" + citySlug;

  // ---------- schedule data (daily static cache) ----------
  // Games are precomputed once a day by tools/fetch-schedules.mjs into
  // data/schedules.json; the browser just reads that one file — no live
  // ESPN calls. Keyed by "<sportPath>:<teamId>".

  async function loadSchedules() {
    // no-cache => revalidate so the daily refresh shows up without a
    // hard reload (a 304 is cheap when nothing changed).
    const res = await fetch(SCHEDULES_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status + " for schedules.json");
    return res.json();
  }

  // Pull one team's games out of the cache and revive dates. Returns
  // null if the team isn't in the cache (renders "Unavailable").
  function gamesForTeam(data, team) {
    const raw = data.teams && data.teams[team.sportPath + ":" + team.teamId];
    if (!raw) return null;
    const games = raw.map((g) => ({
      date: new Date(g.date),
      home: g.home,
      opponent: g.opponent,
      label: g.label || null,
      national: !!g.national,
      natStream: !!g.natStream,
      channels: g.channels || []
    }));
    return games;
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

  // Date label in the viewer's local zone: "Today" / "Tomorrow" for
  // those days, otherwise "Sat, Jul 5". Compares local calendar days,
  // rounded so DST hour shifts don't skew the count.
  function dayLabel(d) {
    const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return fmtDate.format(d);
  }

  // The "sports day" rolls over at 4am local, not midnight — so a game
  // that finishes late still shows (as "Final") to night owls until 4am
  // the next morning, then drops out. Computed as the calendar day of
  // (time − 4h).
  const DAY_ROLLOVER_HOUR = 4;
  function sportsDay(d) {
    const t = new Date(d.getTime() - DAY_ROLLOVER_HOUR * 3600000);
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  }
  function isPastDay(d) {
    return sportsDay(d) < sportsDay(new Date());
  }

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

  // "Starts soon" = the 13 minutes before a scheduled start (and it isn't
  // live/final yet). Time-based, so the /live poll's state signature includes
  // it (below) to re-render when a game crosses the threshold.
  const SOON_MS = 13 * 60000;
  function isSoonDate(d) {
    const ms = d.getTime() - Date.now();
    return ms > 0 && ms <= SOON_MS;
  }
  // Whether a display event is currently live or in the "starts soon" window.
  function liveOrSoon(ev) {
    return !!(ev.live && ev.live.state === "in") ||
      (!(ev.live && ev.live.state === "final") && isSoonDate(ev.date));
  }

  // ---------- TV network -> Puffer link ----------
  // Puffer (Stanford) restreams the over-the-air networks (ABC/CBS/NBC/FOX),
  // so we link those channel names to it — with these carve-outs:
  //  - never on Safari/iOS/iPad (Puffer's player needs Chromium/Firefox);
  //  - NFL FOX/CBS regular/pre-season games are REGIONAL (national=false), and
  //    Puffer only carries the Bay Area feed, so only link them for Bay Area
  //    teams. (NFL playoffs on FOX/CBS are national -> linked like anything.)
  const PUFFER_URL = "https://puffer.stanford.edu/";
  const NO_PUFFER_LINKS = (function () {
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1); // iPadOS
    const isSafari = /Safari/.test(ua) &&
      !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|OPT|Android|SamsungBrowser/.test(ua);
    return isIOS || isSafari;
  })();
  const BAY_AREA_TEAM_IDS = (function () {
    const set = {};
    const bay = window.BALLTOWN.cities["bay-area"];
    if (bay) bay.teams.forEach((t) => (set[t.sportPath + ":" + t.teamId] = true));
    return set;
  })();
  // "Opens in new window": a box with an arrow pointing diagonally up-right.
  const EXT_ICON =
    '<svg class="tv-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>';

  function pufferLinkable(name, ev, team) {
    if (NO_PUFFER_LINKS) return false;
    if (!liveOrSoon(ev)) return false; // only link once the game is live or about to start
    if (!/^(?:ABC|CBS|NBC|FOX)$/i.test(name)) return false; // exact OTA network
    const isNFL = team.sportPath === "football/nfl";
    if (isNFL && /^(?:FOX|CBS)$/i.test(name) && !ev.national) {
      return !!BAY_AREA_TEAM_IDS[team.sportPath + ":" + team.teamId];
    }
    return true;
  }
  function channelsHTML(ev, team) {
    return (ev.channels || [])
      .map((name) =>
        pufferLinkable(name, ev, team)
          ? '<a class="tv-link" href="' + PUFFER_URL +
            '" target="_blank" rel="noopener">' + name + EXT_ICON + "</a>"
          : name
      )
      .join(", ");
  }

  function gameRow(ev, team) {
    const live = ev.live;
    const isLive = !!(live && live.state === "in");
    const isFinal = !!(live && live.state === "final");
    const isSoon = !isLive && !isFinal && isSoonDate(ev.date);
    const lkey = team.sportPath + ":" + team.teamId; // for in-place score updates
    let dateCell, lastCell;
    if (isLive) {
      dateCell = '<span class="g-date"><span class="live-dot"></span>LIVE</span>';
      lastCell = '<span class="g-status" data-lstatus="' + lkey + '">' + live.status + "</span>";
    } else if (isFinal) {
      dateCell = '<span class="g-date">Final</span>';
      // Put the date back where the start time was ("Today" / "Sat, Jul 4").
      lastCell = '<span class="g-time">' + dayLabel(ev.date) + "</span>";
    } else if (isSoon) {
      dateCell = '<span class="g-date"><span class="live-dot"></span>Starts soon</span>';
      lastCell = '<span class="g-time">' + fmtTime.format(ev.date) + "</span>";
    } else {
      dateCell = '<span class="g-date">' + dayLabel(ev.date) + "</span>";
      lastCell = '<span class="g-time">' + fmtTime.format(ev.date) + "</span>";
    }
    // Channels + preseason/national tags are pre-game info — hide once final.
    const extras = !isFinal;
    // W/L/T result badge, from our team's side, on finals only.
    let result = "";
    if (isFinal) {
      const r = live.us > live.them
        ? ["W", "g-win"]
        : live.us < live.them
        ? ["L", "g-loss"]
        : ["T", "g-tie"];
      result = '<span class="g-result ' + r[1] + '">' + r[0] + "</span>";
    }
    return (
      '<li class="game' + (isLive ? " live" : "") + (isFinal ? " final" : "") + (isSoon ? " soon" : "") + '">' +
      dateCell +
      '<span class="g-opp"><span class="vs">' + (ev.home ? "vs" : "at") + "</span>" +
      ev.opponent +
      // score + W/L go first, right after the opponent name
      (isLive || isFinal
        ? '<span class="g-score"' + (isLive ? ' data-lscore="' + lkey + '"' : "") + ">" +
          live.us + "–" + live.them + "</span>"
        : "") +
      result +
      (ev.home ? '<span class="home-tag">Home</span>' : "") +
      (extras && ev.label ? '<span class="g-tag g-tag-pre">' + ev.label + "</span>" : "") +
      (extras && ev.national ? '<span class="g-tag g-tag-nat">Nat\'l TV</span>' : "") +
      (extras && ev.natStream ? '<span class="g-tag g-tag-stream">Nat\'l Stream</span>' : "") +
      (extras && ev.channels && ev.channels.length
        ? '<span class="g-tv">' + channelsHTML(ev, team) + "</span>"
        : "") +
      "</span>" +
      lastCell +
      "</li>"
    );
  }

  // Readable text color (near-black vs white) for text laid over a solid
  // team color. White teams (Whitecaps) and bright golds/yellows/light
  // blues need dark text; everything darker keeps white. WCAG luminance.
  function readableOn(hex) {
    const m = /^#?([0-9a-fA-F]{6})$/.exec(hex || "");
    if (!m) return "#fff";
    const n = parseInt(m[1], 16);
    const lin = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const L =
      0.2126 * lin((n >> 16) & 255) +
      0.7152 * lin((n >> 8) & 255) +
      0.0722 * lin(n & 255);
    return L > 0.5 ? "#0D141D" : "#fff";
  }

  function teamCard(team, events, error) {
    const head =
      '<div class="team-head">' +
      bellHTML(team) +
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
      ";--t2:" + team.colors[1] +
      ";--head-fg:" + readableOn(team.colors[0]) + '">' + head + body + "</section>"
    );
  }

  function upNextCard(item) {
    const live = item.ev.live;
    const isLive = !!(live && live.state === "in");
    const isFinal = !!(live && live.state === "final");
    const isSoon = !isLive && !isFinal && isSoonDate(item.ev.date);
    const lkey = item.team.sportPath + ":" + item.team.teamId;
    const topCell = isLive
      ? '<div class="next-when"><span class="live-dot"></span>LIVE</div>'
      : isFinal
      ? '<div class="next-when">Final</div>'
      : isSoon
      ? '<div class="next-when"><span class="live-dot"></span>Starts soon</div>'
      : '<div class="next-when">' + dayLabel(item.ev.date) + "</div>";
    let result = "";
    if (isFinal) {
      const r = live.us > live.them ? ["W", "g-win"]
        : live.us < live.them ? ["L", "g-loss"] : ["T", "g-tie"];
      result = ' <span class="g-result ' + r[1] + '">' + r[0] + "</span>";
    }
    const bottomCell = isLive || isFinal
      ? '<div class="next-score"><span' + (isLive ? ' data-lscore="' + lkey + '"' : "") + ">" +
        live.us + "–" + live.them + "</span>" +
        (isLive ? ' <span class="next-status" data-lstatus="' + lkey + '">' + live.status + "</span>" : "") +
        result +
        "</div>"
      : '<div class="next-time">' + fmtTime.format(item.ev.date) + " " +
        localTzLabel(item.ev.date) + "</div>";
    return (
      '<div class="next-card' + (isLive ? " live" : "") + (isFinal ? " final" : "") +
      (isSoon ? " soon" : "") + '" style="--tc:' + item.team.colors[0] + '">' +
      '<span class="next-ic" aria-hidden="true">' + sportIcon(item.team) + "</span>" +
      topCell +
      '<div class="next-team">' + shortTeamName(item.team) + "</div>" +
      '<div class="next-opp">' + (item.ev.home ? "vs " : "at ") + item.ev.opponent +
      (item.ev.home ? " · home" : "") + "</div>" +
      (!isFinal && item.ev.channels && item.ev.channels.length
        ? '<div class="next-tv">' + channelsHTML(item.ev, item.team) + "</div>"
        : "") +
      bottomCell +
      "</div>"
    );
  }

  // ---------- team filter ----------

  function chipHTML(t) {
    return (
      '<button type="button" class="chip' +
      (t.added ? " is-added" : "") +
      (hiddenKeys.has(t.key) ? " is-off" : "") +
      '" data-key="' + t.key +
      '" aria-pressed="' + !hiddenKeys.has(t.key) +
      '" style="--tc:' + t.colors[0] + '">' +
      (sportIcon(t)
        ? '<span class="chip-ic" aria-hidden="true">' + sportIcon(t) + "</span>"
        : '<span class="chip-dot"></span>') +
      shortTeamName(t) +
      (t.added
        ? '<span class="chip-remove" role="button" aria-label="Remove team" title="Remove team">×</span>'
        : "") +
      "</button>"
    );
  }

  let filterBound = false;
  let dragSuppressClick = false; // set after a drag so the trailing click is ignored
  function saveHidden() {
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(hiddenKeys)));
    } catch (e) {
      /* private mode */
    }
  }
  function renderFilter() {
    const el = document.getElementById("team-filter");
    if (!el) return;
    el.innerHTML =
      orderedActiveTeams().map(chipHTML).join("") +
      '<button type="button" class="chip chip-add" aria-label="Add a team" ' +
      'title="Add any pro team"><span class="chip-plus" aria-hidden="true">+</span></button>';
    ensureAddPanel(el);
    if (filterBound) return;
    filterBound = true;
    initFilterCollapse(el);
    initChipDrag(el);
    el.addEventListener("click", (e) => {
      if (dragSuppressClick) {
        dragSuppressClick = false;
        return; // this click is the tail of a drag — don't toggle
      }
      if (e.target.closest(".chip-add")) {
        toggleAddPanel();
        return;
      }
      const rm = e.target.closest(".chip-remove");
      if (rm) {
        const chip = rm.closest(".chip");
        if (chip) removeTeam(chip.dataset.key);
        return;
      }
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const key = btn.dataset.key;
      if (hiddenKeys.has(key)) hiddenKeys.delete(key);
      else hiddenKeys.add(key);
      saveHidden();
      applyFilter();
    });
  }

  // ---------- "add any team" search panel ----------
  // Injected once via JS (no template change), so it lives on every city
  // page. Searches the config registry for teams not already on the page.

  function ensureAddPanel(filterEl) {
    if (document.getElementById("team-add")) return;
    const panel = document.createElement("div");
    panel.id = "team-add";
    panel.className = "team-add";
    panel.hidden = true;
    panel.innerHTML =
      '<input type="text" id="team-add-input" class="team-add-input" ' +
      'placeholder="Add any team — search by name, city, or league" ' +
      'autocomplete="off" autocorrect="off" spellcheck="false">' +
      '<ul class="team-add-results" id="team-add-results"></ul>';
    filterEl.insertAdjacentElement("afterend", panel);

    const input = panel.querySelector("#team-add-input");
    const results = panel.querySelector("#team-add-results");
    input.addEventListener("input", () => renderAddResults(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAddPanel();
    });
    results.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-id]");
      if (!li) return;
      addTeam(li.dataset.id);
      input.value = "";
      renderAddResults(""); // refresh (added team drops out of the list)
      input.focus();
    });
    // Click anywhere outside the panel (except the + chip) closes it.
    document.addEventListener("click", (e) => {
      if (panel.hidden) return;
      if (panel.contains(e.target) || e.target.closest(".chip-add")) return;
      closeAddPanel();
    });
  }

  function toggleAddPanel() {
    const panel = document.getElementById("team-add");
    if (!panel) return;
    if (panel.hidden) {
      panel.hidden = false;
      renderAddResults("");
      panel.querySelector("#team-add-input").focus();
    } else {
      closeAddPanel();
    }
  }
  function closeAddPanel() {
    const panel = document.getElementById("team-add");
    if (panel) panel.hidden = true;
  }

  function renderAddResults(query) {
    const results = document.getElementById("team-add-results");
    if (!results) return;
    const q = query.trim().toLowerCase();
    const active = {};
    activeTeams().forEach((t) => (active[idOf(t)] = true));
    if (!q) {
      results.innerHTML =
        '<li class="team-add-hint">Start typing a team, city, or league…</li>';
      return;
    }
    const matches = [];
    Object.keys(REGISTRY).forEach((id) => {
      if (active[id]) return; // already on the page
      const reg = REGISTRY[id];
      const t = reg.team;
      const hay = (
        t.name + " " + (t.short || "") + " " + reg.cityName + " " + t.leagueLabel
      ).toLowerCase();
      if (hay.indexOf(q) === -1) return;
      matches.push(reg);
    });
    matches.sort((a, b) => a.team.name.localeCompare(b.team.name));
    if (!matches.length) {
      results.innerHTML =
        '<li class="team-add-hint">No teams match “' + query.trim() + "”.</li>";
      return;
    }
    results.innerHTML = matches
      .slice(0, 8)
      .map((reg) => {
        const t = reg.team;
        return (
          '<li data-id="' + idOf(t) + '" style="--tc:' + t.colors[0] + '">' +
          '<span class="ta-ic" aria-hidden="true">' + sportIcon(t) + "</span>" +
          '<span class="ta-name">' + t.name + "</span>" +
          '<span class="ta-meta">' + t.leagueLabel + " · " + reg.cityName + "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function addTeam(id) {
    if (!REGISTRY[id]) return;
    if (addedIds.indexOf(id) !== -1) return;
    if (city.teams.some((t) => idOf(t) === id)) return; // already a base team
    addedIds.push(id);
    saveAddedIds();
    hiddenKeys.delete(id); // un-hide if it was hidden before being removed
    saveHidden();
    rebuildResults();
  }

  function removeTeam(key) {
    const i = addedIds.indexOf(key); // added chips use key = id
    if (i === -1) return;
    addedIds.splice(i, 1);
    saveAddedIds();
    hiddenKeys.delete(key);
    saveHidden();
    rebuildResults();
  }

  // Recompute the results array IN PLACE (preserving live overlays) after
  // an add/remove, then re-render. Mutating in place keeps startLive()'s
  // polling reference to the same array valid.
  function rebuildResults() {
    const next = activeTeams().map((team) => {
      const prev = lastResults.find((r) => idOf(r.team) === idOf(team));
      const games = scheduleData ? gamesForTeam(scheduleData, team) : null;
      const r = { team: team, events: games || [], error: games ? null : true };
      if (prev && prev.liveEntry !== undefined) r.liveEntry = prev.liveEntry;
      return r;
    });
    lastResults.length = 0;
    Array.prototype.push.apply(lastResults, next);
    renderFilter();
    renderTeams(lastResults);
    applyFilter();
  }

  // ---------- drag a chip to reorder the cards ----------
  // One Pointer Events path for mouse + touch. Mouse: a small move starts
  // the drag (a plain click still toggles). Touch: a ~450ms long-press
  // starts it (a quick tap toggles, an early move scrolls the page). A
  // floating clone follows the pointer while the original chip stays put
  // as a dimmed placeholder that slides between siblings to show where it
  // will land; on release we persist the order and re-sort the cards.
  function initChipDrag(el) {
    let cand = null; // {chip, startX, startY, lastX, lastY, pointerType, active, timer, ghost, grabX, grabY}

    function stopListening() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    }
    function reset() {
      if (cand) {
        if (cand.timer) clearTimeout(cand.timer);
        if (cand.ghost && cand.ghost.parentNode) cand.ghost.parentNode.removeChild(cand.ghost);
        if (cand.chip) cand.chip.classList.remove("drag-placeholder");
      }
      cand = null;
      stopListening();
    }
    function activate() {
      if (!cand || cand.active) return;
      cand.active = true;
      closeAddPanel();
      const chip = cand.chip;
      const rect = chip.getBoundingClientRect();
      // where inside the chip the pointer grabbed it, so it tracks 1:1
      cand.grabX = cand.lastX - rect.left;
      cand.grabY = cand.lastY - rect.top;
      const ghost = chip.cloneNode(true);
      ghost.classList.add("chip-ghost");
      ghost.style.width = rect.width + "px";
      ghost.style.height = rect.height + "px";
      ghost.style.left = rect.left + "px";
      ghost.style.top = rect.top + "px";
      document.body.appendChild(ghost);
      cand.ghost = ghost;
      chip.classList.add("drag-placeholder");
    }
    function onMove(e) {
      if (!cand) return;
      cand.lastX = e.clientX;
      cand.lastY = e.clientY;
      if (!cand.active) {
        const dist = Math.abs(e.clientX - cand.startX) + Math.abs(e.clientY - cand.startY);
        if (cand.pointerType === "mouse") {
          if (dist > 5) activate(); // mouse: nudge to start dragging
        } else if (dist > 12) {
          reset(); // touch moved before the long-press fired → it's a scroll
          return;
        }
        if (!cand.active) return;
      }
      // The clone follows the finger/cursor.
      if (cand.ghost) {
        cand.ghost.style.left = e.clientX - cand.grabX + "px";
        cand.ghost.style.top = e.clientY - cand.grabY + "px";
      }
      // Slide the placeholder next to whichever chip is under the pointer
      // (left half → before, right half → after).
      const raw = document.elementFromPoint(e.clientX, e.clientY);
      const over = raw ? raw.closest(".chip") : null;
      if (!over || over === cand.chip ||
        over.classList.contains("chip-add") || over.classList.contains("chip-ghost")) return;
      const rect = over.getBoundingClientRect();
      const before = e.clientX < rect.left + rect.width / 2;
      const parent = cand.chip.parentNode;
      parent.insertBefore(cand.chip, before ? over : over.nextSibling);
      const addChip = parent.querySelector(".chip-add");
      if (addChip && addChip !== parent.lastElementChild) parent.appendChild(addChip);
    }
    function onUp() {
      if (cand && cand.active) {
        const parent = cand.chip.parentNode;
        const order = [].slice
          .call(parent.querySelectorAll(".chip:not(.chip-add)"))
          .map((c) => c.dataset.key);
        saveOrder(order);
        dragSuppressClick = true; // swallow the click that follows this drag
        setTimeout(() => (dragSuppressClick = false), 400);
        renderTeams(lastResults); // re-sort the cards to match
        applyFilter();
      }
      reset();
    }
    el.addEventListener("pointerdown", (e) => {
      if (e.button != null && e.button !== 0) return; // primary button only
      const chip = e.target.closest(".chip");
      if (!chip || chip.classList.contains("chip-add")) return;
      if (e.target.closest(".chip-remove")) return; // let the × do its thing
      cand = {
        chip: chip,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        pointerType: e.pointerType,
        active: false,
        timer: null,
        ghost: null
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      if (e.pointerType !== "mouse") {
        cand.timer = setTimeout(activate, 450); // long-press to start on touch
      }
    });
    // Block page scroll only while an active touch drag is under way.
    document.addEventListener(
      "touchmove",
      (e) => {
        if (cand && cand.active) e.preventDefault();
      },
      { passive: false }
    );
  }

  // ---------- collapse the whole chip row ----------
  // A small "Teams" header (injected once) shows/hides the chip row so a
  // viewer who doesn't want the filter/reorder/add controls can tuck them
  // away. Choice is remembered per city.
  function initFilterCollapse(filterEl) {
    if (document.getElementById("filter-toggle")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "filter-toggle";
    btn.className = "filter-toggle";
    btn.setAttribute("aria-controls", "team-filter");
    btn.innerHTML =
      '<span class="filter-caret" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M6 9l6 6 6-6"/></svg></span><span>Teams</span>';
    filterEl.parentNode.insertBefore(btn, filterEl);

    // How-to hint under the chips (hidden along with them when collapsed).
    // Wording follows the primary input: touch devices tap, others click.
    const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const hint = document.createElement("p");
    hint.id = "filter-hint";
    hint.className = "filter-hint";
    hint.textContent =
      (isTouch ? "Tap" : "Click") + " to hide. Drag to re-order.";
    filterEl.insertAdjacentElement("afterend", hint);

    let collapsed = false;
    try {
      collapsed = localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch (e) {
      /* private mode */
    }
    function apply() {
      filterEl.hidden = collapsed;
      hint.hidden = collapsed;
      btn.classList.toggle("is-collapsed", collapsed);
      btn.setAttribute("aria-expanded", String(!collapsed));
      if (collapsed) closeAddPanel();
    }
    apply();
    btn.addEventListener("click", () => {
      collapsed = !collapsed;
      try {
        localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
      } catch (e) {
        /* private mode */
      }
      apply();
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

  // The strip heading is baked per-city ("Up next in the Twin Cities").
  // Once the viewer has added teams from other cities it's no longer just
  // "their city", so drop the locale and show a plain "Up next".
  let baseStripLabel = null;
  function updateStripLabel() {
    const el = document.querySelector(".strip-label");
    if (!el) return;
    if (baseStripLabel === null) baseStripLabel = el.textContent; // capture baked value once
    el.textContent = addedIds.length ? "Up next" : baseStripLabel;
  }

  function renderStrip() {
    updateStripLabel();
    const stripEl = document.getElementById("upnext-strip");
    if (!lastResults.length) return; // still loading
    const all = [];
    lastResults.forEach((r) => {
      if (hiddenKeys.has(r.team.key)) return;
      // Includes live + finished-today games (finals stay as "Final +
      // score" until the 4am rollover, same as on the team card) plus
      // upcoming games; displayEvents already drops past-4am games.
      displayEvents(r).forEach((ev) => all.push({ team: r.team, ev }));
    });
    all.sort((a, b) => a.ev.date - b.ev.date);
    stripEl.innerHTML = all.length
      ? all.slice(0, UP_NEXT_COUNT).map(upNextCard).join("")
      : '<p class="strip-empty">All teams are hidden — tap a team above to bring them back.</p>';
  }

  // ---------- add-to-home-screen prompt (mobile only) ----------

  function initInstallPrompt() {
    // Already running as an installed app? Nothing to prompt.
    const standalone =
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
    if (standalone) return;

    const DISMISS_KEY = "balltown:a2hs-dismissed";
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch (e) {
      /* private mode — just proceed without persistence */
    }

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
      // iPadOS 13+ reports as Mac; detect via touch.
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    if (!isIOS && !isAndroid) return; // desktop: no prompt
    // In-app browsers (Telegram, Reddit, Instagram, Facebook, X, …) are
    // embedded webviews where "Add to Home Screen" is unavailable or
    // broken — don't nag with an install prompt there. UA-based, so it
    // can't be perfect for every wrapper, but it catches the common ones:
    // Android System WebView (the `wv` token), the big social apps, and
    // iOS WKWebViews (real Safari always keeps the "Safari/" token).
    const inAppBrowser =
      /\bwv\b/.test(ua) ||
      /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|Twitter|TikTok|musical_ly|Bytedance|Snapchat|Pinterest|LinkedInApp|Reddit|Telegram|GSA/i.test(ua) ||
      (isIOS && !/Safari/.test(ua));
    if (inAppBrowser) return;
    // On iOS only Safari can add to the home screen; in-app / other
    // browsers can't, so don't give them dead instructions.
    const iosCantInstall = isIOS && /CriOS|FxiOS|EdgiOS|GSA/.test(ua);
    if (iosCantInstall) return;
    // Firefox on Android can install, but (like iOS Safari) it never
    // fires beforeinstallprompt — that event is Chromium-only. So it
    // gets manual instructions instead of a one-tap button.
    const isAndroidFirefox = isAndroid && /Firefox|FxiOS|Fennec/i.test(ua);

    const shareGlyph =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 15V3M8.5 6.5 12 3l3.5 3.5"/>' +
      '<path d="M6 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1"/></svg>';
    // iOS Safari toolbar "More" button: a circle with three dots.
    const moreGlyph =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<circle cx="8" cy="12" r="1.5" fill="currentColor" stroke="none"/>' +
      '<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>' +
      '<circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>';
    // "Add to Home Screen" row icon: a plus in a rounded square.
    const plusSquareGlyph =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round">' +
      '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/>' +
      '<path d="M12 8.5v7M8.5 12h7"/></svg>';
    // Firefox / Android overflow menu: three vertical dots.
    const vDotsGlyph =
      '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">' +
      '<circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/>' +
      '<circle cx="12" cy="19" r="1.7"/></svg>';
    // Firefox "More" submenu: three horizontal dots.
    const hDotsGlyph =
      '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">' +
      '<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/>' +
      '<circle cx="19" cy="12" r="1.7"/></svg>';
    // Firefox "Add app to Home screen" row icon (calendar-like).
    const calendarGlyph =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3.5" y="5" width="17" height="16" rx="3"/>' +
      '<path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>';

    let deferred = null;

    function removeBanner(remember) {
      const bar = document.getElementById("a2hs");
      if (bar) {
        bar.classList.remove("in");
        setTimeout(() => bar.remove(), 250);
      }
      if (remember) {
        try {
          localStorage.setItem(DISMISS_KEY, "1");
        } catch (e) {
          /* ignore */
        }
      }
    }

    function showBanner(kind) {
      if (document.getElementById("a2hs")) return;
      const bar = document.createElement("div");
      bar.id = "a2hs";
      bar.className = "a2hs";
      bar.setAttribute("role", "dialog");
      bar.setAttribute("aria-label", "Add to home screen");

      const ic = (glyph) => '<span class="a2hs-ic">' + glyph + "</span>";
      let body;
      if (kind === "android") {
        // Chromium: one-tap install via the captured event.
        body =
          '<div class="a2hs-text"><b>Install ball.town as an app</b>' +
          "<span>Add it to your home screen for one-tap access.</span></div>" +
          '<button type="button" class="a2hs-add">Install</button>';
      } else if (kind === "firefox") {
        // Firefox Android: overflow menu -> More -> Add app to Home screen.
        body =
          '<div class="a2hs-text"><b>Install ball.town as an app</b>' +
          "<span>Tap " + ic(vDotsGlyph) + " then " + ic(hDotsGlyph) +
          " <b>More</b> then " + ic(calendarGlyph) +
          " <b>Add app to Home screen</b></span></div>";
      } else {
        // iOS Safari: manual via the More / Share sheet.
        body =
          '<div class="a2hs-text"><b>Install ball.town as an app</b>' +
          "<span>Tap " + ic(moreGlyph) + " then " + ic(shareGlyph) +
          " <b>Share</b> then " + ic(plusSquareGlyph) +
          " <b>Add to Home Screen</b></span></div>";
      }

      bar.innerHTML =
        '<div class="a2hs-inner">' + body +
        '<button type="button" class="a2hs-x" aria-label="Dismiss">&times;</button>' +
        "</div>";
      document.body.appendChild(bar);
      requestAnimationFrame(() => bar.classList.add("in"));

      bar.querySelector(".a2hs-x").addEventListener("click", () =>
        removeBanner(true)
      );
      const addBtn = bar.querySelector(".a2hs-add");
      if (addBtn) {
        addBtn.addEventListener("click", async () => {
          if (!deferred) return removeBanner(true);
          deferred.prompt();
          try {
            await deferred.userChoice;
          } catch (e) {
            /* ignore */
          }
          deferred = null;
          removeBanner(true);
        });
      }
    }

    // Android / Chromium: the browser tells us when it's installable.
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferred = e;
      showBanner("android");
    });
    window.addEventListener("appinstalled", () => removeBanner(true));

    // Browsers without beforeinstallprompt (iOS Safari, Firefox on
    // Android) never signal installability — show instructions instead.
    if (isIOS) setTimeout(() => showBanner("ios"), 1500);
    else if (isAndroidFirefox) setTimeout(() => showBanner("firefox"), 1500);
  }

  // ---------- sticky mini-header (mobile) ----------
  // Slides in a compact "ball.town <ABBR> · All cities" bar once the
  // page's main header scrolls out of view. CSS shows it on mobile
  // only; the scroll wiring is harmless on desktop (display:none).

  function initStickyHeader() {
    const bar = document.createElement("div");
    bar.className = "ministicky";
    bar.innerHTML =
      '<div class="ministicky-in">' +
      '<a class="brand2" href="../index.html">ball<span>.town</span>' +
      (city.abbr ? ' <span class="abbr">' + city.abbr + "</span>" : "") +
      "</a>" +
      '<a class="crumb" href="../index.html">All cities</a>' +
      "</div>";
    document.body.appendChild(bar);

    let trigger = 120;
    let ticking = false;
    function measure() {
      const tb = document.querySelector("header .topbar");
      if (tb) {
        const r = tb.getBoundingClientRect();
        trigger = r.bottom + window.scrollY; // absolute Y where brand exits
      }
    }
    function update() {
      bar.classList.toggle("show", window.scrollY > trigger);
      ticking = false;
    }
    measure();
    update();
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", () => {
      measure();
      update();
    });
  }

  // ---------- pick up code updates once a day ----------
  // An installed PWA keeps its page in memory, so reopening it doesn't
  // re-fetch anything — new deploys never reach it until a real reload.
  // Live scores don't need this (the /live poll refreshes them in place),
  // so we reload only to grab a new code deploy + that day's schedule:
  // when the app returns to the foreground and the sports day (4am
  // rollover) has changed since it was loaded. That's at most once a day,
  // never on a same-day app-switch.
  function initAutoRefresh() {
    const loadedDay = sportsDay(new Date());
    function maybeReload() {
      if (document.visibilityState !== "visible") return;
      if (sportsDay(new Date()) !== loadedDay) location.reload();
    }
    document.addEventListener("visibilitychange", maybeReload);
    window.addEventListener("pageshow", maybeReload); // also covers bfcache restores
  }

  // ---------- live scores ----------

  // The games to actually show for a team: scheduled upcoming games plus
  // the live/final game from /live, matched onto the right day (or added
  // as a standalone row if it's a finished game that's already dropped
  // out of the schedule). Past days (before the 4am rollover) are removed.
  function displayEvents(r) {
    const entry = r.liveEntry || null;
    const list = r.events.map((e) => Object.assign({}, e, { live: null }));
    if (entry && entry.date) {
      const key = new Date(entry.date).toDateString();
      const target = list.find((e) => e.date.toDateString() === key);
      if (target) {
        target.live = entry; // live/final overlaid onto the same scheduled game
      } else {
        list.unshift({    // finished game no longer scheduled — synthesize a row
          date: new Date(entry.date),
          home: !!entry.home,
          opponent: entry.opponent || "TBD",
          channels: [],
          label: null,
          national: false,
          live: entry
        });
      }
    }
    return list.filter((e) => !isPastDay(e.date));
  }

  // Surgically update just the score + status text of in-progress games,
  // in EVERY place they appear (the team-card row AND the up-next strip),
  // without re-rendering anything. This is what runs on a plain 30s score
  // tick — the DOM elements carry data-lscore / data-lstatus keys.
  function updateLiveScores(results) {
    results.forEach((r) => {
      const e = r.liveEntry;
      if (!e || e.state !== "in") return;
      const key = r.team.sportPath + ":" + r.team.teamId;
      const score = e.us + "–" + e.them;
      document.querySelectorAll('[data-lscore="' + key + '"]').forEach((el) => {
        el.textContent = score;
      });
      document.querySelectorAll('[data-lstatus="' + key + '"]').forEach((el) => {
        el.textContent = e.status;
      });
    });
  }

  function renderTeams(results) {
    const teamsEl = document.getElementById("teams");
    // in-season teams first, offseason/error last
    let rows = results.map((r) => ({
      team: r.team,
      error: r.error,
      events: displayEvents(r)
    }));
    // A user-set drag order wins; otherwise default to in-season first.
    if (loadOrder().length) {
      rows = applyOrder(rows, (r) => r.team.key);
    } else {
      rows.sort((a, b) => (b.events.length ? 1 : 0) - (a.events.length ? 1 : 0));
    }
    teamsEl.innerHTML = rows.map((r) => teamCard(r.team, r.events, r.error)).join("");
  }

  // Poll /live and overlay in-progress scores onto each team's current
  // game. Only re-renders when something actually changed, so idle
  // pages (no live games) don't churn the DOM every interval.
  function startLive(results) {
    let lastDay = sportsDay(new Date());
    let lastStateSig = "";
    async function poll() {
      let games = null;
      try {
        const data = await (await fetch(LIVE_URL, { cache: "no-cache" })).json();
        games = (data && data.games) || {};
      } catch (e) {
        games = null; // /live unreachable this cycle — keep state as-is
      }
      // Store the raw entry per team, only on a successful fetch.
      if (games) {
        results.forEach((r) => {
          r.liveEntry = games[r.team.sportPath + ":" + r.team.teamId] || null;
        });
      }

      // Full re-render (cards + strip) only when the SET of live/final
      // STATES changes (a game starts, ends, or drops) or the day rolls
      // over. On a plain score tick, update the score/status text in
      // place instead — so the page never re-renders every 30 seconds.
      const today = sportsDay(new Date());
      const dayRolled = today !== lastDay;
      if (dayRolled) lastDay = today;
      const sig = results
        .map((r) => {
          const e = r.liveEntry;
          const s = e ? e.state + (isPastDay(new Date(e.date)) ? "p" : "a") : "-";
          // include "soon" so crossing the 13-min threshold forces a re-render
          const soon = (r.events || []).some((g) => isSoonDate(g.date)) ? "s" : "";
          return s + soon;
        })
        .join("|");
      if (sig !== lastStateSig || dayRolled) {
        lastStateSig = sig;
        renderTeams(results);
        applyFilter();
      } else {
        updateLiveScores(results); // score/clock tick — in-place, no re-render
      }
    }
    poll();
    setInterval(poll, LIVE_POLL_MS);
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

    let data;
    try {
      data = await loadSchedules();
    } catch (err) {
      console.error("schedules.json", err);
      const failed = activeTeams().map((team) => ({ team, events: [], error: err }));
      teamsEl.innerHTML = failed.map((r) => teamCard(r.team, r.events, r.error)).join("");
      lastResults = failed;
      applyFilter();
      return;
    }
    scheduleData = data; // kept so added teams can be rendered on demand

    const results = activeTeams().map((team) => {
      const games = gamesForTeam(data, team);
      return { team, events: games || [], error: games ? null : true };
    });

    lastResults = results;
    renderTeams(results);
    applyFilter();      // up-next strip + grayed-out filtered cards
    startLive(results); // overlay in-progress scores, then poll

    const stamp = document.getElementById("updated");
    if (stamp) {
      const gen = data.generated ? new Date(data.generated) : new Date();
      stamp.textContent =
        "Schedules updated " +
        new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
        }).format(gen) + " " + localTzLabel(gen) + " · refreshed daily";
    }
  }

  // Show the running code's version at the very bottom, so a deploy can be
  // confirmed on any device (including an installed PWA once it reloads).
  function renderVersion() {
    const foot = document.querySelector("footer");
    if (!foot || document.getElementById("appver")) return;
    const v = document.createElement("span");
    v.id = "appver";
    v.className = "appver";
    v.textContent = "v" + APP_VERSION;
    foot.appendChild(v);
  }

  // Dismissible tagline on city pages: inject an × and remember the choice
  // (globally, so it stays hidden across cities). The main city-picker page
  // doesn't load app.js, so its tagline is never dismissible.
  const TAGLINE_KEY = "balltown:tagline-dismissed";
  function initTaglineDismiss() {
    const el = document.querySelector(".tagline");
    if (!el) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(TAGLINE_KEY) === "1";
    } catch (e) {
      /* private mode */
    }
    if (dismissed) {
      el.hidden = true;
      return;
    }
    el.classList.add("has-dismiss");
    const x = document.createElement("button");
    x.type = "button";
    x.className = "tagline-x";
    x.setAttribute("aria-label", "Dismiss");
    x.textContent = "×";
    x.addEventListener("click", () => {
      el.hidden = true;
      try {
        localStorage.setItem(TAGLINE_KEY, "1");
      } catch (e) {
        /* private mode */
      }
    });
    el.appendChild(x);
  }

  // ---------- game-day / pre-game push notifications ----------
  // Per-team checkboxes (Morning-of and 10-min-before). Prefs are stored
  // globally (one push subscription per browser covers every city) and
  // synced to the server so the cron Worker can send. Requires a service
  // worker + notification permission; on iPhone it only works once the site
  // is installed to the home screen (Apple limitation).
  const VAPID_PUBLIC_KEY = "BOZEc7VQpit0jPAcZE3BXZCzhqT23wELtqJmk5f-n2djhUUkEcxf3B9IILmTmoQEM8NI12wBrFUfJeQeKw-zwdE";
  const NOTIFY_KEY = "balltown:notify"; // global: { "<sportPath>:<teamId>": {morning,pre,short,code} }
  const CITY_CODE = String(city.code || city.abbr || citySlug).toLowerCase();

  function loadNotify() {
    try { return JSON.parse(localStorage.getItem(NOTIFY_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveNotify(p) {
    try { localStorage.setItem(NOTIFY_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function urlB64ToU8(s) {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const b = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(b);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function bufToB64url(buf) {
    const b = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  // Push the current prefs (+ this browser's subscription) to the server.
  async function syncNotify() {
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToU8(VAPID_PUBLIC_KEY)
      });
    }
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC";
    await fetch("/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: bufToB64url(subscription.getKey("p256dh")),
        auth: bufToB64url(subscription.getKey("auth")),
        tz: tz,
        prefs: loadNotify()
      })
    });
    return { ok: true };
  }

  // Bell button on each team card opens a little popover with the two
  // options for that team. NOTIFY_SUPPORTED gates whether cards show a bell.
  const NOTIFY_SUPPORTED =
    "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const BELL_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M18 8.4A6 6 0 1 0 6 8.4C6 15 3 17 3 17h18s-3-2-3-8.6"/>' +
    '<path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  function notifyOn(id) {
    const p = loadNotify()[id];
    return !!(p && (p.morning || p.pre));
  }
  // Bell markup for a card header (empty string when notifications aren't
  // supported). Team names have no double-quotes, so plain interpolation is ok.
  function bellHTML(team) {
    if (!NOTIFY_SUPPORTED) return "";
    const id = team.sportPath + ":" + team.teamId;
    return (
      '<button type="button" class="bell' + (notifyOn(id) ? " on" : "") +
      '" data-id="' + id + '" aria-label="Game alerts for ' + team.name +
      '" title="Game alerts">' + BELL_SVG + "</button>"
    );
  }

  function ensureBellPanel() {
    if (document.getElementById("bell-panel")) return;
    const p = document.createElement("div");
    p.id = "bell-panel";
    p.className = "bell-panel";
    p.hidden = true;
    p.innerHTML =
      '<div class="bell-title"></div>' +
      '<label class="bell-opt"><input type="checkbox" data-kind="morning"> Morning of game day</label>' +
      '<label class="bell-opt"><input type="checkbox" data-kind="pre"> 10 minutes before start</label>' +
      '<p class="bell-note"></p>';
    document.body.appendChild(p);

    p.addEventListener("change", async (e) => {
      const box = e.target.closest('input[type="checkbox"]');
      if (!box) return;
      const id = p.dataset.id;
      const kind = box.dataset.kind === "morning" ? "morning" : "pre";
      const cur = loadNotify();
      const pref = cur[id] || { morning: false, pre: false };
      pref[kind] = box.checked;
      pref.short = p.dataset.short || (REGISTRY[id] ? shortTeamName(REGISTRY[id].team) : id);
      pref.code = CITY_CODE;
      if (!pref.morning && !pref.pre) delete cur[id];
      else cur[id] = pref;
      saveNotify(cur);
      const note = p.querySelector(".bell-note");
      note.classList.remove("err");
      const res = await syncNotify().catch(() => ({ ok: false, reason: "error" }));
      if (!res.ok) {
        box.checked = false; // couldn't subscribe — revert this toggle
        const cur2 = loadNotify();
        if (cur2[id]) {
          cur2[id][kind] = false;
          if (!cur2[id].morning && !cur2[id].pre) delete cur2[id];
          saveNotify(cur2);
        }
        note.classList.add("err");
        note.textContent = res.reason === "denied"
          ? "Notifications are blocked — enable them in your browser settings."
          : "Couldn't turn on notifications. On iPhone, add ball.town to your Home Screen first.";
      }
      const bell = document.querySelector('.bell[data-id="' + id + '"]');
      if (bell) bell.classList.toggle("on", notifyOn(id));
    });

    document.addEventListener("click", (e) => {
      if (p.hidden) return;
      if (p.contains(e.target) || e.target.closest(".bell")) return;
      p.hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") p.hidden = true;
    });
  }

  function openBellPanel(bell) {
    const p = document.getElementById("bell-panel");
    if (!p) return;
    const id = bell.dataset.id;
    if (!p.hidden && p.dataset.id === id) { p.hidden = true; return; } // toggle
    const short = REGISTRY[id] ? shortTeamName(REGISTRY[id].team) : id;
    p.dataset.id = id;
    p.dataset.short = short;
    p.querySelector(".bell-title").textContent = short + " alerts";
    const pref = loadNotify()[id] || {};
    p.querySelector('input[data-kind="morning"]').checked = !!pref.morning;
    p.querySelector('input[data-kind="pre"]').checked = !!pref.pre;
    const note = p.querySelector(".bell-note");
    note.classList.remove("err");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
    note.textContent = isIOS && !standalone
      ? "On iPhone, add ball.town to your Home Screen first." : "";
    // anchor under the bell, right edges aligned; kept on-screen
    p.hidden = false;
    const r = bell.getBoundingClientRect();
    p.style.top = r.bottom + 6 + "px";
    p.style.left = "auto";
    p.style.right = Math.max(8, window.innerWidth - r.right) + "px";
  }

  function initNotify() {
    if (!NOTIFY_SUPPORTED) return;
    ensureBellPanel();
    const teamsEl = document.getElementById("teams");
    if (!teamsEl || teamsEl.dataset.bellBound) return;
    teamsEl.dataset.bellBound = "1";
    teamsEl.addEventListener("click", (e) => {
      const bell = e.target.closest(".bell");
      if (!bell) return;
      e.stopPropagation();
      openBellPanel(bell);
    });
  }

  initInstallPrompt();
  initStickyHeader();
  initAutoRefresh();
  renderVersion();
  initTaglineDismiss();
  initNotify();
  main();
})();
