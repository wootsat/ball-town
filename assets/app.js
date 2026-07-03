// ============================================================
// ball.town — schedule renderer
// Reads a daily-refreshed static cache (data/schedules.json, built by
// tools/fetch-schedules.mjs) and renders it. No live ESPN calls from
// the browser — one small same-origin fetch per page load — so ESPN
// load is decoupled from visitor count.
// ============================================================

(function () {
  const UP_NEXT_COUNT = 5;
  // The daily static cache the browser reads instead of calling ESPN.
  const SCHEDULES_URL = "../data/schedules.json";
  // In-progress scores from the /live Pages Function (edge-cached ~30s).
  const LIVE_URL = "../live";
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
    const live = ev.live;
    const dateCell = live
      ? '<span class="g-date"><span class="live-dot"></span>LIVE</span>'
      : '<span class="g-date">' + dayLabel(ev.date) + "</span>";
    const lastCell = live
      ? '<span class="g-status">' + live.status + "</span>"
      : '<span class="g-time">' + fmtTime.format(ev.date) + "</span>";
    return (
      '<li class="game' + (live ? " live" : "") + '">' +
      dateCell +
      '<span class="g-opp"><span class="vs">' + (ev.home ? "vs" : "at") + "</span>" +
      ev.opponent +
      (ev.home ? '<span class="home-tag">Home</span>' : "") +
      (ev.label ? '<span class="g-tag g-tag-pre">' + ev.label + "</span>" : "") +
      (ev.national ? '<span class="g-tag g-tag-nat">Nat\'l TV</span>' : "") +
      (live ? '<span class="g-score">' + live.us + "–" + live.them + "</span>" : "") +
      (ev.channels && ev.channels.length
        ? '<span class="g-tv">' + ev.channels.join(", ") + "</span>"
        : "") +
      "</span>" +
      lastCell +
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
    const live = item.ev.live;
    const topCell = live
      ? '<div class="next-when"><span class="live-dot"></span>LIVE</div>'
      : '<div class="next-when">' + dayLabel(item.ev.date) + "</div>";
    const bottomCell = live
      ? '<div class="next-score">' + live.us + "–" + live.them +
        ' <span class="next-status">' + live.status + "</span></div>"
      : '<div class="next-time">' + fmtTime.format(item.ev.date) + " " +
        localTzLabel(item.ev.date) + "</div>";
    return (
      '<div class="next-card' + (live ? " live" : "") + '" style="--tc:' + item.team.colors[0] + '">' +
      '<span class="next-ic" aria-hidden="true">' + sportIcon(item.team) + "</span>" +
      topCell +
      '<div class="next-team">' + shortTeamName(item.team) + "</div>" +
      '<div class="next-opp">' + (item.ev.home ? "vs " : "at ") + item.ev.opponent +
      (item.ev.home ? " · home" : "") + "</div>" +
      (item.ev.channels && item.ev.channels.length
        ? '<div class="next-tv">' + item.ev.channels.join(", ") + "</div>"
        : "") +
      bottomCell +
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
    // On iOS only Safari can add to the home screen; in-app / other
    // browsers can't, so don't give them dead instructions.
    const iosCantInstall = isIOS && /CriOS|FxiOS|EdgiOS|GSA/.test(ua);
    if (iosCantInstall) return;
    // Firefox on Android can install, but (like iOS Safari) it never
    // fires beforeinstallprompt — that event is Chromium-only. So it
    // gets manual instructions instead of a one-tap button.
    const isAndroidFirefox = isAndroid && /Firefox|FxiOS|Fennec/i.test(ua);

    const appName =
      (document.querySelector('meta[name="apple-mobile-web-app-title"]') || {})
        .content || "this page";

    const shareGlyph =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 15V3M8.5 6.5 12 3l3.5 3.5"/>' +
      '<path d="M6 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1"/></svg>';
    // iOS Safari toolbar "More" button: a circle with three dots.
    const moreGlyph =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<circle cx="8" cy="12" r="1.15" fill="currentColor" stroke="none"/>' +
      '<circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/>' +
      '<circle cx="16" cy="12" r="1.15" fill="currentColor" stroke="none"/></svg>';
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
          '<div class="a2hs-text"><b>' + appName + "</b>" +
          "<span>Add it to your home screen for one-tap access.</span></div>" +
          '<button type="button" class="a2hs-add">Install</button>';
      } else if (kind === "firefox") {
        // Firefox Android: overflow menu -> More -> Add app to Home screen.
        body =
          '<div class="a2hs-text"><b>' + appName + "</b>" +
          "<span>Tap " + ic(vDotsGlyph) + " then " + ic(hDotsGlyph) +
          " <b>More</b> then " + ic(calendarGlyph) +
          " <b>Add app to Home screen</b></span></div>";
      } else {
        // iOS Safari: manual via the More / Share sheet.
        body =
          '<div class="a2hs-text"><b>' + appName + "</b>" +
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

  // ---------- live scores ----------

  function renderTeams(results) {
    const teamsEl = document.getElementById("teams");
    // in-season teams first, offseason/error last
    const sorted = results.slice().sort(
      (a, b) => (b.events.length ? 1 : 0) - (a.events.length ? 1 : 0)
    );
    teamsEl.innerHTML = sorted.map((r) => teamCard(r.team, r.events, r.error)).join("");
  }

  // Poll /live and overlay in-progress scores onto each team's current
  // game. Only re-renders when something actually changed, so idle
  // pages (no live games) don't churn the DOM every interval.
  function startLive(results) {
    async function poll() {
      let data;
      try {
        data = await (await fetch(LIVE_URL, { cache: "no-cache" })).json();
      } catch (e) {
        return; // endpoint unavailable (e.g. local static server) — skip
      }
      const games = (data && data.games) || {};
      let changed = false;
      results.forEach((r) => {
        if (!r.events.length) return;
        const live = games[r.team.sportPath + ":" + r.team.teamId] || null;
        const cur = r.events[0].live || null;
        if (JSON.stringify(cur) !== JSON.stringify(live)) {
          r.events[0].live = live;
          changed = true;
        }
      });
      if (changed) {
        renderTeams(results);
        applyFilter();
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
      const failed = city.teams.map((team) => ({ team, events: [], error: err }));
      teamsEl.innerHTML = failed.map((r) => teamCard(r.team, r.events, r.error)).join("");
      lastResults = failed;
      applyFilter();
      return;
    }

    const results = city.teams.map((team) => {
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

  initInstallPrompt();
  initStickyHeader();
  main();
})();
