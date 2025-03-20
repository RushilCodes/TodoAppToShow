# Multi-stage Hono + Bun API
FROM oven/bun:slim AS builder
WORKDIR /app
COPY . .
RUN bun i 
RUN bun run build

FROM oven/bun:slim AS runner
WORKDIR /app
COPY --from=builder /app .
CMD ["bun", "run", "start"]
