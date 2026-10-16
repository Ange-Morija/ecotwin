# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm ci --strict-ssl=true
COPY scripts/build-web.mjs scripts/build-web.mjs
COPY vite.config.ts tsconfig.json ./
COPY web web
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=frontend --chown=nginx:nginx /build/web/dist /usr/share/nginx/html
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
