# Image statique Nginx pour servir /web
FROM nginx:1.27-alpine

# Remarque: simple, prêt pour prod/loc
COPY public /usr/share/nginx/html/
COPY styles /usr/share/nginx/html/styles/
COPY js /usr/share/nginx/html/js/

# En-têtes basiques (cache court)
RUN printf 'add_header Cache-Control "public, max-age=300";\n' \
  >> /etc/nginx/conf.d/default.conf
