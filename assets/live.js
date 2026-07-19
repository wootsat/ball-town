// "Live Now" page (/live). Fetches /scores and renders an Up-Next-style
// tile for every in-progress game across all leagues. Refreshes every 30s.
// Self-contained (doesn't use app.js, which is city-page specific).
(function () {
  const SCORES_URL = "/scores";
  const POLL_MS = 30000;

  // Generic per-sport line icons (same set as app.js).
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
  // Sport display order + header labels (games are grouped under these;
  // a sport with no live games doesn't appear).
  const SPORT_ORDER = ["football", "basketball", "baseball", "hockey", "soccer"];
  const SPORT_LABEL = {
    football: "Football", basketball: "Basketball", baseball: "Baseball",
    hockey: "Hockey", soccer: "Soccer"
  };
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ---------- TV network -> Puffer link (same rules as the city pages) ----------
  // Puffer (Stanford) restreams the OTA networks (ABC/CBS/NBC/FOX). Every game
  // on this page is in-progress, so the city pages' "live/soon only" gate is
  // always met here. Carve-outs mirror app.js: never on Safari/iOS/iPad, and
  // NFL regular/pre-season FOX/CBS are regional (Bay Area feed only).
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
    const bay = window.BALLTOWN && window.BALLTOWN.cities && window.BALLTOWN.cities["bay-area"];
    if (bay) bay.teams.forEach((t) => (set[t.sportPath + ":" + t.teamId] = true));
    return set;
  })();
  const EXT_ICON =
    '<svg class="tv-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>';
  function pufferLinkable(name, g) {
    if (NO_PUFFER_LINKS) return false;
    if (!/^(?:ABC|CBS|NBC|FOX)$/i.test(name)) return false; // exact OTA network
    if (g.sportPath === "football/nfl" && /^(?:FOX|CBS)$/i.test(name) && !g.national) {
      return !!(BAY_AREA_TEAM_IDS[g.sportPath + ":" + g.homeId] ||
                BAY_AREA_TEAM_IDS[g.sportPath + ":" + g.awayId]);
    }
    return true;
  }
  function channelsHTML(g) {
    return (g.channels || [])
      .map((name) =>
        pufferLinkable(name, g)
          ? '<a class="tv-link" href="' + PUFFER_URL +
            '" target="_blank" rel="noopener">' + esc(name) + EXT_ICON + "</a>"
          : esc(name)
      )
      .join(", ");
  }

  function tile(g) {
    const chans = channelsHTML(g);
    return (
      '<div class="next-card live"' + (g.homeColor ? ' style="--tc:' + esc(g.homeColor) + '"' : "") + ">" +
      '<span class="next-ic" aria-hidden="true">' + (SPORT_ICONS[g.sport] || "") + "</span>" +
      '<div class="next-when"><span class="live-dot"></span>LIVE</div>' +
      // Both teams get identical white styling (no home/away favoritism);
      // "at" is just a small muted connector (away team is at home's venue).
      '<div class="next-team">' + esc(g.away) + "</div>" +
      '<div class="next-vs">at</div>' +
      '<div class="next-team">' + esc(g.home) + "</div>" +
      '<div class="next-score"><span>' + Number(g.awayScore) + "–" + Number(g.homeScore) + "</span> " +
      '<span class="next-status">' + esc(g.status) + "</span></div>" +
      (chans ? '<div class="next-tv">' + chans + "</div>" : "") +
      "</div>"
    );
  }
  // Render one <section> per sport that has games, in SPORT_ORDER; any
  // unexpected sport falls to the end.
  function render(live) {
    const bySport = {};
    live.forEach((g) => { (bySport[g.sport] || (bySport[g.sport] = [])).push(g); });
    const order = SPORT_ORDER.filter((s) => bySport[s])
      .concat(Object.keys(bySport).filter((s) => SPORT_ORDER.indexOf(s) === -1));
    return order.map((s) =>
      '<section class="live-group">' +
      '<h2 class="live-sport">' + esc(SPORT_LABEL[s] || s) + "</h2>" +
      '<div class="live-grid">' + bySport[s].map(tile).join("") + "</div>" +
      "</section>"
    ).join("");
  }
  async function load() {
    const groups = document.getElementById("live-groups");
    const empty = document.getElementById("live-empty");
    if (!groups) return;
    let live;
    try {
      const data = await (await fetch(SCORES_URL, { cache: "no-cache" })).json();
      live = (data && data.live) || [];
    } catch (e) {
      // Transient failure: keep any games already shown. But if we've never
      // rendered (e.g. /scores unreachable — including on localhost, where
      // Functions don't run), surface the empty state instead of a blank
      // page. Self-heals on the next successful poll.
      if (!groups.children.length && empty) empty.hidden = false;
      return;
    }
    if (!live.length) {
      groups.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    groups.innerHTML = render(live);
  }
  load();
  setInterval(load, POLL_MS);

  // "← Back" returns to wherever you came from (a city page or the home
  // page). If we arrived from a same-origin page, go back in history;
  // otherwise (direct hit / external link) fall through to the href
  // (../index.html — the home page).
  (function () {
    const back = document.getElementById("back-link");
    if (!back) return;
    const ref = document.referrer;
    const internal = ref && ref.indexOf(location.origin + "/") === 0 && ref !== location.href;
    if (internal) {
      back.addEventListener("click", function (e) {
        e.preventDefault();
        history.back();
      });
    }
  })();
})();
