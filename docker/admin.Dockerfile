FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/admin/package.json apps/admin/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
RUN pnpm install --frozen-lockfile
FROM deps AS builder
COPY . .
RUN pnpm turbo build --filter=@gatevia/admin
FROM node:22-alpine AS runner
ENV NODE_ENV=production PORT=3001
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
USER nextjs
EXPOSE 3001
CMD ["node","apps/admin/server.js"]
