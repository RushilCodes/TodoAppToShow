# Multi-stage Qwik + Bun build
FROM oven/bun:slim AS builder
WORKDIR /app
COPY . .
ENV QWIK_DISABLE_NATIVE_BINDING=true
RUN bun install 
RUN bun run build

FROM oven/bun:slim AS runner
WORKDIR /app
COPY --from=builder /app .
CMD ["bun", "serve"]

