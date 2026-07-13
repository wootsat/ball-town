-- ball.town push-notification storage (Cloudflare D1).
-- Apply with:  wrangler d1 execute balltown-notify --file=schema.sql

-- One row per browser push subscription.
CREATE TABLE IF NOT EXISTS subscriptions (
  endpoint   TEXT PRIMARY KEY,   -- the browser's push endpoint URL
  p256dh     TEXT NOT NULL,      -- subscription public key (base64url)
  auth       TEXT NOT NULL,      -- subscription auth secret (base64url)
  tz         TEXT NOT NULL,      -- IANA timezone, for the morning-of alert
  prefs      TEXT NOT NULL,      -- JSON: {"<sportPath>:<teamId>":{morning,pre,short,code}}
  updated_at INTEGER NOT NULL
);

-- Dedup log so a given alert fires at most once.
CREATE TABLE IF NOT EXISTS sent (
  id TEXT PRIMARY KEY,           -- endpoint | kind | gameKeyOrDate
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sent_ts ON sent(ts);
