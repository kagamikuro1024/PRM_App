# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Needed by Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

# ----------------------------
# Dependencies stage
# ----------------------------
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

# ----------------------------
# Builder stage
# ----------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ----------------------------
# Runner stage
# ----------------------------
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.* ./

COPY docker-entrypoint.sh ./docker-entrypoint.sh
# Note: we need to make sure permissions are executable, but since we copy it to builder first or runner, we'll run chmod
# Wait, user nextjs needs to run the entrypoint, let's make it owned by nextjs or readable
RUN chmod +x ./docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
