FROM oven/bun:latest as builder
# check=skip=SecretsUsedInArgOrEnv

WORKDIR /app


COPY pages/ pages/
COPY server/ server/
COPY lib/ lib/
COPY layouts/ layouts/
COPY components/ components/
COPY assets/ assets/

COPY package.json bun.lock ./
COPY tsconfig.json vite.config.ts tailwind.config.js components.json ./

COPY hono-entry.node.ts hono-entry.ts ./

ARG PUBLIC_ENV__SRV_URL

ENV PUBLIC_ENV__SRV_URL=$PUBLIC_ENV__SRV_URL

RUN bun install
RUN bun run build

FROM node:latest

RUN npm install -g tsx


WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY hono-entry.node.ts hono-entry.ts ./

ARG PUBLIC_ENV__SRV_URL
ENV NODE_ENV=production
ENV PUBLIC_ENV__SRV_URL=$PUBLIC_ENV__SRV_URL

EXPOSE 3000

CMD ["tsx", "hono-entry.node.ts"]
