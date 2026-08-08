# Qalcurate

Qalcurate is an offline-first Progressive Web App (PWA) for recording
conversations, transcribing them live in the browser via the Web Speech API,
and delivering the recording (title, timestamp, duration, transcript, and
audio file) to a webhook of your choice — automatically, as soon as the
device is back online.

It ships as a bilingual (German/English) client-only app: no backend, no
database, no build step. A single `nginx` container serves the static files.

## Features

- **In-browser speech recognition** — live transcript while recording, with a
  selectable recognition language (`de-DE`, `de-AT`, `de-CH`, `en-US`, `en-GB`).
- **Offline-first recording** — a lost connection never blocks a recording;
  it is queued locally (IndexedDB) and submitted automatically once the
  device reconnects. A per-recording lock guarantees each recording is
  delivered exactly once, even if an automatic retry and a manual "Resend"
  happen at the same time.
- **Webhook delivery** — every recording is POSTed as `multipart/form-data`
  (`id`, `title`, `createdAt`, `durationSec`, `transcript`, `source`, `audio`)
  to a webhook URL configured in the app's settings — ready to plug into
  automation tools such as n8n, Make, or a custom endpoint.
- **Installable PWA** — installable to the home screen/desktop, with an
  offline app shell cached by a service worker.
- **Bilingual UI** — a header toggle switches the entire interface between
  German and English; the choice is persisted across restarts.
- **Light & dark mode** — toggle from the side menu; persisted across
  restarts.
- **History view** — every recording with its delivery status
  (pending/sent/error), audio playback, and a per-item resend/delete action.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) and the Docker Compose plugin
  (`docker compose version`), **or**
- Any modern browser and a local static file server for development without
  Docker (see [Local development](#local-development-without-docker) below).

Because the app requests microphone access and uses the Web Speech API,
serve it over **HTTPS** (or `http://localhost` for local testing) — browsers
block both APIs on plain HTTP for any other host.

## Quick start (Docker Compose)

```bash
git clone https://github.com/V4P-Roland/qalcurate.git
cd qalcurate
docker compose up --build -d
```

The app is now available at [http://localhost:8080](http://localhost:8080).

To use a different port, set `PORT` before starting (or create a `.env` file
with `PORT=3000`):

```bash
PORT=3000 docker compose up --build -d
```

Stop the container with:

```bash
docker compose down
```

### Updating

Pull the latest code and rebuild the image:

```bash
git pull
docker compose up --build -d
```

## Configuration

All configuration happens inside the app itself — there are no environment
variables for app behavior. Open **Settings** after starting the app and set:

- **Webhook URL** — the endpoint that receives every finished recording via
  `POST multipart/form-data`. Use **Test connection** to send a sample
  payload and verify your endpoint responds correctly.
- **Speech recognition language** — selectable from the recorder view before
  starting a recording.

The interface language (German/English) and light/dark theme are switched
independently from the header and side menu, respectively.

## Local development (without Docker)

Any static file server works, as long as it's reachable over
`http://localhost` or HTTPS (required for microphone access):

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed URL in your browser. Changes to `index.html`,
`app.js`, or `style.css` only require a browser reload — there is no build
step.

## Project structure

```
.
├── Dockerfile             # nginx:alpine image serving the static app
├── docker-compose.yml     # single-service Compose setup
├── docker/nginx.conf      # cache/MIME headers tuned for a PWA + service worker
├── index.html             # app shell (recorder, history, settings, side menu)
├── app.js                 # app logic: recording, speech recognition, IndexedDB
│                           #   queue, offline sync, i18n, theming
├── style.css / base.css   # design tokens and component styles
├── sw.js                  # service worker (offline app-shell caching)
├── manifest.json          # PWA manifest (icons, name, theme colors)
└── assets/                # icons, logo, and Product Sans font files
```

## Tech stack

Vanilla JavaScript (ES2020+), the browser's native
[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
and [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder),
IndexedDB for the local offline queue, and a Service Worker for the installable
app shell. No frontend framework and no build tooling are required. The
Docker image is `nginx:alpine`.

## Browser support

Live speech recognition (`SpeechRecognition` / `webkitSpeechRecognition`) is
currently only available in Chromium-based browsers (Chrome, Edge, Brave,
Opera). Recording and offline delivery work in any modern browser; without
speech recognition support, the transcript field stays empty and can be
filled in manually.
