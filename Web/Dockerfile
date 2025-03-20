# -------------------------------
# Stage 1: Builder (Ubuntu + Bun)
# -------------------------------
    FROM ubuntu:latest AS builder
    RUN apt update && apt install -y curl unzip git build-essential ca-certificates
    RUN curl -fsSL https://bun.sh/install | bash
    ENV PATH="/root/.bun/bin:$PATH"
    WORKDIR /app
    COPY . .
    RUN bun install
    RUN bun run build
    
# -----------------------------------------
# Stage 2: Lightweight Runtime (Ubuntu + Bun only)
# -----------------------------------------
FROM oven/bun:slim AS runner
RUN apt update && apt install -y curl unzip ca-certificates 
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["bun", "start"]
    