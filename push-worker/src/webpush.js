// Minimal Web Push sender for Cloudflare Workers — VAPID (RFC 8292) +
// aes128gcm payload encryption (RFC 8291), using only Web Crypto. No deps.

const enc = new TextEncoder();

function b64urlToBytes(s) {
  s = String(s).replace(/-/g, "+").replace(/_/g, "/");
  s += "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s);
  const b = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  return b;
}
function bytesToB64url(buf) {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function concat(...arrs) {
  let len = 0;
  for (const a of arrs) len += a.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}
async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: salt, info: info }, key, len * 8
  );
  return new Uint8Array(bits);
}

// VAPID Authorization header for a given endpoint.
async function vapidAuth(endpoint, vapid) {
  const aud = new URL(endpoint).origin;
  const header = bytesToB64url(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = bytesToB64url(enc.encode(JSON.stringify({
    aud: aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: vapid.subject
  })));
  const signingInput = header + "." + payload;
  // import the VAPID private key (raw 32-byte scalar) as a JWK.
  const pub = b64urlToBytes(vapid.publicKey); // 65-byte uncompressed point
  const jwk = {
    kty: "EC", crv: "P-256", ext: true,
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    d: bytesToB64url(b64urlToBytes(vapid.privateKey))
  };
  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key, enc.encode(signingInput)
  );
  const jwt = signingInput + "." + bytesToB64url(sig);
  return "vapid t=" + jwt + ", k=" + vapid.publicKey;
}

// Encrypt + POST a payload to one subscription. Returns the fetch Response
// (caller checks .status: 201 ok; 404/410 => subscription gone).
export async function sendPush(sub, payloadStr, vapid) {
  const uaPublic = b64urlToBytes(sub.p256dh); // 65
  const authSecret = b64urlToBytes(sub.auth); // 16

  // ephemeral server ECDH keypair
  const asKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", asKeys.publicKey)); // 65
  const uaKey = await crypto.subtle.importKey(
    "raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []
  );
  const ecdh = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, asKeys.privateKey, 256)
  );

  // RFC 8291 key combination, then RFC 8188 content-encryption keying.
  const keyInfo = concat(enc.encode("WebPush: info\0"), uaPublic, asPublic);
  const ikm = await hkdf(authSecret, ecdh, keyInfo, 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);

  // single record: plaintext || 0x02 (final-record delimiter), no padding.
  const plaintext = concat(enc.encode(payloadStr), new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, aesKey, plaintext)
  );

  // aes128gcm header: salt(16) | rs(4=4096) | idlen(1) | keyid(asPublic 65)
  const header = concat(salt, new Uint8Array([0, 0, 16, 0]), new Uint8Array([asPublic.length]), asPublic);
  const body = concat(header, ct);

  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidAuth(sub.endpoint, vapid),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "2419200"
    },
    body: body
  });
}
