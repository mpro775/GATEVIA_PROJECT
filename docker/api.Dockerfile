FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl && corepack enable
WORKDIR /app
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile && pnpm prisma:generate
FROM deps AS builder
COPY . .
RUN pnpm turbo build --filter=@gatevia/api
FROM base AS runner
RUN apk add --no-cache curl
ENV NODE_ENV=production PORT=3002
RUN addgroup -S nodejs && adduser -S api -G nodejs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/contracts ./packages/contracts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/prisma ./prisma
USER api
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3002/api/v1/health/ready || exit 1
CMD ["node","apps/api/dist/main.js"]

