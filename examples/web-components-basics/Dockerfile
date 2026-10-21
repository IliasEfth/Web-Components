FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html demo.css demo.js /usr/share/nginx/html/
COPY components /usr/share/nginx/html/components

HEALTHCHECK --interval=5s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost/ > /dev/null || exit 1
