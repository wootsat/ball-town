# App icons

These are the home-screen / install icons for the installable web app.
The three PNGs here are **auto-generated placeholders** — replace them
with your own art (same filenames, same pixel sizes) whenever you like.

| File                   | Size (px) | Used by |
|------------------------|-----------|---------|
| `icon-192.png`         | 192×192   | Android install (required) |
| `icon-512.png`         | 512×512   | Android install + splash; also the maskable icon |
| `apple-touch-icon.png` | 180×180   | iOS "Add to Home Screen" |

Design notes:

- Make them **full-bleed squares with no transparency.** iOS rounds
  the corners itself, and Android's maskable icon crops to a circle/
  squircle — keep the important art within the centre ~80% ("safe
  zone") so nothing gets clipped.
- `icon-512.png` doubles as the Android *maskable* icon (see
  `city/*.webmanifest`), so it especially needs that safe-zone margin.
- `icon.svg` is the vector master for the current placeholder; edit and
  re-export, or ignore it entirely if you're supplying your own.

All three are referenced by `city/*.webmanifest` and the `<link>` tags
in each `city/*.html`. Filenames are shared across every city, so you
only replace them once.
