# Tabata Timer

A simple, phone-friendly Tabata interval timer. Static site, no build step, no dependencies.

- Default protocol: 20s work / 10s rest / 8 rounds (4 minutes total) — adjustable in Settings
- Distinct audio signal for the start of each **work** interval and each **rest** interval, plus a completion chime
- Sounds are synthesized in-browser with the Web Audio API (no audio files, works offline)

## Run locally

Just open `index.html` in a browser, or serve the folder statically, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deploy

This is a static site (`index.html`, `style.css`, `app.js`) — it can be served directly by GitHub Pages with no build step. See repo Settings → Pages.
