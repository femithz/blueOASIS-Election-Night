# Use Debian-based image so lightningcss (Tailwind/PostCSS) native bindings install correctly (Alpine musl often misses them)
FROM node:20-bookworm-slim AS base

# Install dependencies (npm install works without lockfile; avoids npm ci failure in CI/recruiter builds)
FROM base AS deps
WORKDIR /app
COPY package*.json ./
# Ensure optional native deps (e.g., lightningcss) are installed on Linux ARM/AMD
# Some npm setups skip the postinstall that copies the native .node into lightningcss,
# so we defensively copy it if needed.
RUN npm install --include=optional \
  && if [ "$(node -e 'process.stdout.write(process.platform)')" = "linux" ]; then \
       ARCH="$(node -e 'process.stdout.write(process.arch)')"; \
       npm install --include=optional "lightningcss-linux-${ARCH}-gnu" || true; \
       npm install --include=optional "lightningcss-linux-${ARCH}-musl" || true; \
       npm install --include=optional "@tailwindcss/oxide-linux-${ARCH}-gnu" || true; \
       npm install --include=optional "@tailwindcss/oxide-linux-${ARCH}-musl" || true; \
     fi \
  && node -e ' \
    const fs = require("fs"); \
    const path = require("path"); \
    const root = path.join("node_modules","lightningcss"); \
    if (!fs.existsSync(root)) process.exit(0); \
    const existing = fs.readdirSync(root).find(f => f.startsWith("lightningcss.") && f.endsWith(".node")); \
    if (existing) process.exit(0); \
    const dirs = fs.readdirSync("node_modules").filter(d => d.startsWith("lightningcss-")); \
    for (const d of dirs) { \
      const pkg = path.join("node_modules", d); \
      if (!fs.existsSync(pkg) || !fs.statSync(pkg).isDirectory()) continue; \
      const file = fs.readdirSync(pkg).find(f => f.startsWith("lightningcss.") && f.endsWith(".node")); \
      if (!file) continue; \
      fs.copyFileSync(path.join(pkg, file), path.join(root, file)); \
      break; \
    } \
  '

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Use node_modules SWC (from deps stage); avoid Next patching lockfile (which can hit yarn registry and fail)
ENV NEXT_IGNORE_INCORRECT_LOCKFILE=1
RUN npm run build

# Production image: Alpine for smaller size (standalone has no build-time native deps)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -D nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# If standalone traced-in express-session exists, make it use SESSION_SECRET from env (no app sessions needed)
RUN set -e; \
  if [ -f node_modules/express-session/index.js ]; then \
    node -e " \
      const fs=require('fs'); \
      const p='node_modules/express-session/index.js'; \
      let c=fs.readFileSync(p,'utf8'); \
      c=c.replace(/var secret = opts\.secret/, 'var secret = opts.secret || process.env.SESSION_SECRET'); \
      fs.writeFileSync(p,c); \
    "; \
  fi

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
