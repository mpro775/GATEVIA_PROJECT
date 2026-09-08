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
ENV NODE_ENV=production PORT=3002
RUN addgroup -S nodejs && adduser -S api -G nodejs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/prisma ./prisma
USER api
EXPOSE 3002
CMD ["node","apps/api/dist/main.js"]
