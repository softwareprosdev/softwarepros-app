# syntax=docker/dockerfile:1

# Image for coolify-compose.yaml. One image serves two commands: the `migrate`
# service runs scripts/db-migrate.sh, the `app` service runs `next start`.
#
# `next start` is used rather than `output: "standalone"` — see the note in
# next.config.ts. That means node_modules ships in the runtime image, which
# also gives the migrate service the Prisma CLI it needs.

FROM node:22-alpine AS base
# Prisma's schema engine (used by `migrate deploy`) is dynamically linked
# against OpenSSL; alpine does not ship it.
RUN apk add --no-cache openssl
WORKDIR /app

# ---------------------------------------------------------------- dependencies
FROM base AS deps
# prisma/ and prisma.config.ts land before `npm install` because `postinstall`
# runs `prisma generate`, which reads them.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# Generate needs *a* connection string present, never a reachable one — no
# database is contacted at build time.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
# `npm install`, not `npm ci`: package-lock.json was last regenerated before
# @supabase/ssr, @supabase/supabase-js and stripe were added to package.json,
# and `npm ci` hard-fails on any mismatch between the two rather than
# reconciling it. `npm install` updates the lock file to match during the
# build instead, at the cost of not pinning transitive versions as tightly
# as `npm ci` would. Run `npm install` locally once (committing the
# regenerated package-lock.json) and switch this back to `npm ci` to restore
# fully reproducible builds.
RUN npm ci

# --------------------------------------------------------------------- build
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
# The generated Prisma client is gitignored; it comes from `postinstall` in the
# deps stage. Copied after the source so a stale local copy cannot shadow it.
COPY --from=deps /app/src/generated ./src/generated

# public/ is empty and git does not track empty directories, so a fresh clone
# has no public/ and the runtime `COPY /app/public` fails the build. A local
# checkout keeps the directory, which is exactly why this only breaks on the
# deploy server. Create it so the copy has something to find either way.
RUN mkdir -p public

# NEXT_PUBLIC_* is inlined into the client bundle at build time, so it has to
# be a build arg. Set it in Coolify or the deploy ships the fallback origin in
# every canonical URL, sitemap entry and Open Graph tag.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
# Same deal: Supabase Auth runs client-side, so its project URL and publishable
# key have to be baked into the bundle here too, not just handed to the
# container at runtime.
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
# Every page that reads the database is `force-dynamic`, so the build itself
# never connects. The placeholder only satisfies module-level construction.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm run build

# -------------------------------------------------------------------- runtime
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/src/generated ./src/generated
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node package.json package-lock.json next.config.ts prisma.config.ts ./

# Git checkouts on Windows lose the executable bit.
RUN chmod +x ./scripts/*.sh

USER node
EXPOSE 3000
# Migrations run in the entrypoint, so the schema is always applied before the
# server accepts its first request — no separate service, and nothing to
# forget on the deploy side.
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
