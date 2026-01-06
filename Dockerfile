  FROM node:20-slim AS base

  RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources 2>/dev/null || \
      sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list 2>/dev/null || true

  FROM base AS deps
  RUN apt-get update && apt-get install -y \
        openssl \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/*
  WORKDIR /app

  ENV PUPPETEER_SKIP_DOWNLOAD=true
  ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

  COPY package.json package-lock.json* ./
  RUN npm config set registry https://registry.npmmirror.com && \
      npm ci

  FROM base AS builder
  RUN apt-get update && apt-get install -y \
        openssl \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/*
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .

  ENV DATABASE_URL="file:./dev.db"

  RUN npx prisma generate

  ENV NEXT_TELEMETRY_DISABLED=1
  ENV NODE_OPTIONS="--max-old-space-size=2048"
  ENV NEXT_SKIP_STATIC_GENERATION=1
  ENV SKIP_STATIC_GENERATION=true
  RUN npm run build

  FROM base AS runner
  WORKDIR /app

  RUN apt-get update && apt-get install -y \
        chromium \
        openssl \
        ca-certificates \
        fonts-liberation \
        libnss3 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2 \
        && rm -rf /var/lib/apt/lists/*

  ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
  ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

  ENV NODE_ENV=production
  ENV NEXT_TELEMETRY_DISABLED=1

  RUN addgroup --system --gid 1001 nodejs && \
      adduser --system --uid 1001 --home /app nextjs

  COPY --from=builder /app/public ./public
  COPY --from=builder /app/.next/standalone ./
  COPY --from=builder /app/.next/static ./.next/static
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

  COPY docker-entrypoint.sh /app/
  RUN chmod +x /app/docker-entrypoint.sh

  # 创建 npm 缓存目录并设置正确的所有权
  RUN mkdir -p /app/.npm && \
      chown -R nextjs:nodejs /app

  USER nextjs

  EXPOSE 3000

  ENV PORT=3000
  ENV HOSTNAME="0.0.0.0"

  ENTRYPOINT ["/app/docker-entrypoint.sh"]
  CMD ["node", "server.js"]
