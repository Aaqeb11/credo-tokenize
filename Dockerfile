# Builder stage
FROM oven/bun:1.1.18 AS builder
WORKDIR /app

COPY package.json ./package.json
COPY bun.lock ./bun.lock

RUN bun install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Stage 2: Production image
FROM oven/bun:1.1.18-alpine
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["bun", "run", "start"]
