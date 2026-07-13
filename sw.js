// ball.town service worker — its only job is push notifications (game-day
// and pre-game alerts). Served from the site root so its scope is the whole
// site. No offline caching: pages stay network-first (see CLAUDE.md).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "ball.town", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "ball.town";
  const options = {
    body: data.body || "",
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/badge.png", // monochrome silhouette for the Android status bar
    tag: data.tag || undefined, // collapse duplicates with the same tag
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.indexOf(url) !== -1 && "focus" in w) return w.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
