# ball.town push notifications — setup

Free-tier web-push for game-day and pre-game alerts. Three moving parts:

| Piece | Where | Job |
|---|---|---|
| Service worker | `/sw.js` (site root) | receives pushes, shows the notification |
| Subscribe API | `functions/push/subscribe.js` (Pages Function) | saves each browser's subscription + prefs to D1 |
| Sender | this folder (a **separate Worker** on a 5-min cron) | matches games → subscribers, sends the pushes |

The site (Pages) auto-deploys on `git push` as usual. The **Worker here is deployed separately** with Wrangler, and both it and the Pages project bind the **same D1 database**.

## One-time setup

1. **Install Wrangler & log in**
   ```
   npm i -g wrangler
   wrangler login
   ```

2. **Generate VAPID keys** (the identity that authorizes your pushes)
   ```
   npx web-push generate-vapid-keys
   ```
   Copy the **public** key into two places:
   - `assets/app.js` → `VAPID_PUBLIC_KEY`
   - `push-worker/wrangler.toml` → `VAPID_PUBLIC_KEY`
   Keep the **private** key for step 5 (never commit it).

3. **Create the D1 database + tables**
   ```
   wrangler d1 create balltown-notify
   ```
   Paste the printed `database_id` into `wrangler.toml`, then:
   ```
   cd push-worker
   wrangler d1 execute balltown-notify --remote --file=schema.sql
   ```

4. **Bind D1 to the Pages project** (so the subscribe Function can write):
   Cloudflare dashboard → your Pages project → **Settings → Functions → D1 database bindings** → add binding **`DB`** → database **balltown-notify**. Redeploy the site once after adding.

5. **Set the Worker's private key + deploy** (from `push-worker/`):
   ```
   wrangler secret put VAPID_PRIVATE_KEY   # paste the private key from step 2
   wrangler deploy                         # deploys the Worker + registers the cron
   ```

That's it. The cron runs every 5 minutes; morning alerts fire at ~08:00 in each
user's local timezone, pre-game alerts ~10 minutes before kickoff.

## Notes / limits (free plan)
- **iPhone:** notifications only work if the user has **added ball.town to their Home Screen** (Apple restriction). Android works in-browser.
- Sends are capped at 45 per cron run (the free plan's 50-subrequest limit). Fine for small scale; upgrading to Workers Paid ($5/mo) removes it and unlocks Durable Objects / Queues for cleaner fan-out and exact timing.
- `schedules.json` refreshes daily, so alerts reflect the same games the site shows.

## Test it
1. Open ball.town on a phone (installed to Home Screen on iPhone), tick a box under **Game alerts**, allow notifications.
2. Confirm a row appears in D1: `wrangler d1 execute balltown-notify --remote --command "SELECT endpoint, prefs FROM subscriptions"`.
3. Force a send without waiting for a game: temporarily widen the window or set `MORNING_HOUR` in `src/index.js`, or trigger the scheduled handler locally with `wrangler dev --test-scheduled` then hit `/__scheduled`.
