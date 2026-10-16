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

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 ALLOW_REGISTRATION=false
WORKDIR /app
COPY api/requirements.txt /app/api/requirements.txt
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export PIP_CERT=/run/secrets/proxy_ca; fi; \
    pip install --no-cache-dir -r api/requirements.txt
COPY --chown=10001:10001 api/src /app/api/src
COPY --from=frontend --chown=10001:10001 /build/web/dist /app/web/dist
RUN useradd --create-home --uid 10001 ecotwin && mkdir /app/.runtime && chown ecotwin:ecotwin /app/.runtime
USER ecotwin
EXPOSE 8000
CMD ["python","-m","uvicorn","api.src.main:app","--host","0.0.0.0","--port","8000"]
