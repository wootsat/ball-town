// ball.town static generator.
// Reads data/cities.js and emits, for every city:
//   <code>/index.html        (from tools/city.template.html)
//   <code>/<code>.webmanifest
// served at the short URL ball.town/<code>. Also rewrites the city cards
// in index.html (between the CITIES markers), sitemap.xml, and _redirects
// (old /city/<slug> URLs -> the new short code).
//
// Run:  node tools/build.mjs   (or: npm run build)
// No dependencies. Commit the generated files — Cloudflare Pages serves
// them as-is (it does not run this script).

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { cities } = require(join(root, "data", "cities.js"));

const template = readFileSync(join(root, "tools", "city.template.html"), "utf8");
const THEME = "#0D141D";
const SITE = "https://ball.town"; // canonical origin for SEO tags + sitemap

// Short, shareable URL code per city (ball.town/<code>). Defaults to the
// lowercased abbr; a city may override it with a `code` field. Codes must
// be unique — they become top-level paths.
const codeOf = (slug, city) => String(city.code || city.abbr || slug).toLowerCase();
{
  const seen = {};
  for (const [slug, city] of Object.entries(cities)) {
    const c = codeOf(slug, city);
    if (seen[c]) {
      throw new Error("Duplicate URL code '" + c + "' (" + seen[c] + " and " + slug + ")");
    }
    seen[c] = slug;
  }
}

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const NUMWORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"
];
function countWord(n) {
  const w = NUMWORDS[n] || String(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function tagline(city) {
  if (city.tagline) return city.tagline; // hand-written override wins
  const teams = city.teams || [];
  // One-team metros get a team-specific line; multi-team metros get the
  // "<N> pro teams, one page." blurb (same shape as Minneapolis).
  if (teams.length === 1) {
    return (
      "Upcoming games for the " + esc(teams[0].name) +
      ", with dates and start times shown in your local time."
    );
  }
  return (
    "<b>" + countWord(teams.length) + " pro teams, one page.</b> " +
    "Upcoming games for every " + esc(city.shortName) +
    " club, with dates and start times shown in your local time."
  );
}

// Plain-text meta description (search results + social link previews).
function description(city) {
  return (
    "Upcoming games, live scores, and TV listings for every pro team in " +
    city.name +
    " — NFL, NBA, MLB, NHL, MLS and WNBA on one page, in your local time."
  );
}

// Manifest lives at /<code>/<code>.webmanifest and uses absolute paths so
// it resolves the same however Cloudflare serves the short URL. Scope is
// the whole site so tapping through to other cities stays in the app.
function manifest(code, city) {
  return {
    name: "ball.town " + city.abbr,
    short_name: "ball.town " + city.abbr,
    description: "Upcoming games for every " + city.name + " pro team.",
    start_url: "/" + code,
    scope: "/",
    display: "standalone",
    background_color: THEME,
    theme_color: THEME,
    icons: [
      { src: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}

function cityPage(slug, city) {
  const code = codeOf(slug, city);
  return template
    .replace(/\{\{SLUG\}\}/g, slug) // data-city -> config key (app.js lookup)
    .replace(/\{\{CODE\}\}/g, code)
    .replace(/\{\{NAME\}\}/g, esc(city.name))
    .replace(/\{\{ABBR\}\}/g, esc(city.abbr || ""))
    .replace(/\{\{MANIFEST\}\}/g, "/" + code + "/" + code + ".webmanifest")
    .replace(/\{\{DESCRIPTION\}\}/g, esc(description(city)))
    .replace(/\{\{TAGLINE\}\}/g, tagline(city))
    .replace(/\{\{STRIP_LABEL\}\}/g, esc(city.stripLabel || "Up next in " + city.shortName));
}

function indexCards() {
  return Object.entries(cities)
    .sort((a, b) => a[1].name.localeCompare(b[1].name)) // alphabetical by city
    .map(([slug, city]) => {
      const code = codeOf(slug, city);
      const names = city.teams.map((t) => esc(t.short || t.name)).join(" · ");
      // Everything the search box matches against: city + code + team names.
      const search = esc(
        (city.name + " " + city.shortName + " " + (city.abbr || "") + " " + code + " " +
          city.teams.map((t) => t.name + " " + (t.short || "")).join(" ")
        ).toLowerCase()
      );
      return (
        '  <a class="city-card" href="/' + code + '" data-search="' + search + '">\n' +
        "    <h2>" + esc(city.name) + "</h2>\n" +
        "    <p>" + names + "</p>\n" +
        "  </a>"
      );
    })
    .join("\n");
}

const START = "<!-- CITIES:START (generated by tools/build.mjs — do not edit by hand) -->";
const END = "<!-- CITIES:END -->";

// Old per-city folder is replaced by top-level short-code dirs; drop it so
// the _redirects below (not a stale file) answer the old /city/... URLs.
rmSync(join(root, "city"), { recursive: true, force: true });

let written = 0;
for (const [slug, city] of Object.entries(cities)) {
  const code = codeOf(slug, city);
  const dir = join(root, code);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), cityPage(slug, city));
  writeFileSync(
    join(dir, code + ".webmanifest"),
    JSON.stringify(manifest(code, city), null, 2) + "\n"
  );
  written += 2;
  console.log("  " + code + "/ (index.html + " + code + ".webmanifest)");
}

const indexPath = join(root, "index.html");
let index = readFileSync(indexPath, "utf8");
const block = START + "\n" + indexCards() + "\n  " + END;
const re = new RegExp(START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + END);
if (!re.test(index)) {
  throw new Error("index.html is missing the CITIES:START/END markers.");
}
index = index.replace(re, block);
writeFileSync(indexPath, index);

// sitemap.xml — home page + every city's short URL.
const urls = [SITE + "/"].concat(
  Object.entries(cities).map(([slug, city]) => SITE + "/" + codeOf(slug, city))
);
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map((u) => "  <url><loc>" + u + "</loc><changefreq>daily</changefreq></url>")
    .join("\n") +
  "\n</urlset>\n";
writeFileSync(join(root, "sitemap.xml"), sitemap);

// _redirects — keep the old /city/<slug> URLs (and any already-installed
// PWA whose start_url points there) working by 301'ing to the short code.
const redirects =
  Object.entries(cities)
    .map(([slug, city]) => {
      const code = codeOf(slug, city);
      return (
        "/city/" + slug + ".html  /" + code + "  301\n" +
        "/city/" + slug + "  /" + code + "  301"
      );
    })
    .join("\n") + "\n";
writeFileSync(join(root, "_redirects"), redirects);

console.log(
  "Generated " + written + " files for " + Object.keys(cities).length +
  " cities, index.html, sitemap.xml (" + urls.length + " urls), and _redirects."
);
