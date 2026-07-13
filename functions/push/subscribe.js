// Pages Function: POST /push/subscribe — upsert a browser's push
// subscription + its per-team alert prefs into D1. Same origin as the site,
// so no CORS. Binds the D1 database as `DB` (set in the Pages project's
// Settings → Functions → D1 database bindings, name it DB -> balltown-notify).
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "D1 not bound" }, 500);
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "bad json" }, 400);
  }
  const { endpoint, p256dh, auth, tz, prefs } = body || {};
  if (!endpoint || !p256dh || !auth) return json({ error: "missing fields" }, 400);

  const prefsStr = JSON.stringify(prefs && typeof prefs === "object" ? prefs : {});
  try {
    await env.DB.prepare(
      "INSERT INTO subscriptions (endpoint, p256dh, auth, tz, prefs, updated_at) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6) " +
      "ON CONFLICT(endpoint) DO UPDATE SET " +
      "p256dh=?2, auth=?3, tz=?4, prefs=?5, updated_at=?6"
    ).bind(endpoint, p256dh, auth, String(tz || "UTC"), prefsStr, Date.now()).run();
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
  return json({ ok: true });
}

// Optional: DELETE /push/subscribe?endpoint=... to drop a subscription.
export async function onRequestDelete({ request, env }) {
  if (!env.DB) return json({ error: "D1 not bound" }, 500);
  const endpoint = new URL(request.url).searchParams.get("endpoint");
  if (!endpoint) return json({ error: "missing endpoint" }, 400);
  try {
    await env.DB.prepare("DELETE FROM subscriptions WHERE endpoint = ?").bind(endpoint).run();
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
  return json({ ok: true });
}
