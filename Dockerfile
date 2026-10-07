# syntax=docker/dockerfile:1
# Production image for the admin app (Next.js standalone output).
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/admin/package.json apps/admin/
COPY features/package.json features/
COPY packages/auth/package.json packages/auth/
COPY packages/api-client/package.json packages/api-client/
COPY packages/config/package.json packages/config/
COPY packages/motion/package.json packages/motion/
COPY packages/theme/package.json packages/theme/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# NEXT_PUBLIC_* values are inlined at build time. Demo mode is OFF unless you opt in explicitly.
ARG NEXT_PUBLIC_API_BASE_URL=
ARG NEXT_PUBLIC_DEMO_MODE=false
ARG NEXT_PUBLIC_APP_NAME="Nexus Admin"
ARG NEXT_PUBLIC_DEFAULT_THEME=modern-saas
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_DEFAULT_THEME=$NEXT_PUBLIC_DEFAULT_THEME
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @nexus/admin build

FROM node:22-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S nexus && adduser -S nexus -G nexus
COPY --from=build --chown=nexus:nexus /repo/apps/admin/.next/standalone ./
COPY --from=build --chown=nexus:nexus /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build --chown=nexus:nexus /repo/apps/admin/public ./apps/admin/public
USER nexus
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "apps/admin/server.js"]
