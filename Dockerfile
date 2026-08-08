# Qalcurate is a static PWA (vanilla HTML/CSS/JS) — no build step, no runtime
# dependencies. We just serve the files with nginx, adding the correct
# cache/MIME headers for a service-worker-based app (see docker/nginx.conf).
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY index.html base.css style.css app.js sw.js manifest.json ./
COPY assets/ ./assets/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
