FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl && corepack enable
WORKDIR /app
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile && pnpm prisma:generate
FROM deps AS builder
COPY . .
RUN pnpm turbo build --filter=@gatevia/worker
FROM base AS runner

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S worker -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules

COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json

USER worker

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const fs=require('fs');const c=fs.readFileSync('/proc/1/cmdline','utf8');process.exit(c.includes('apps/worker/dist/main.js')?0:1)"

CMD ["node","apps/worker/dist/main.js"]
