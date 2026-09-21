# syntax=docker/dockerfile:1.7

##############################################################################
# Stage 1: dependencies
# Installs the full dependency tree (incl. devDependencies) needed to build.
# Kept as its own stage so it's cached independently of source changes.
##############################################################################
FROM node:22-alpine AS deps
WORKDIR /app

# better-sqlite3 is a native addon and must be compiled from source on
# Alpine/musl - prebuilt glibc binaries won't load here.
RUN apk add --no-cache python3 make g++ curl

# Install pnpm as a static musl binary straight from GitHub releases instead
# of via corepack, which resolves/fetches through registry.npmjs.org and can
# be unreachable or blocked in some build environments. The plain
# "pnpm-linux-x64" release asset is glibc-dynamic and won't run on Alpine
# (confirmed: fails to exec, and gcompat can't bridge it either) - the
# "-musl" asset is fully static and Alpine-compatible.
ARG PNPM_VERSION=12.4.2
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linux-x64-musl.tar.gz" \
      -o /tmp/pnpm.tar.gz \
    && mkdir -p /opt/pnpm \
    && tar -xzf /tmp/pnpm.tar.gz -C /opt/pnpm \
    && ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm \
    && rm /tmp/pnpm.tar.gz \
    && pnpm --version

# Copy only the files that determine the dependency graph so this layer is
# cached until the lockfile/manifest actually change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

##############################################################################
# Stage 2: build
# Compiles the SvelteKit app (adapter-node) and strips dev dependencies back
# out of node_modules, leaving only what's needed to run the built server.
##############################################################################
FROM deps AS build
WORKDIR /app

# SvelteKit's postbuild route analysis imports every server module (incl.
# src/lib/server/db/index.ts, which throws if DATABASE_URL is unset) even
# though nothing is actually queried at build time. A throwaway path is
# enough to satisfy it - the real value is supplied at `podman run`.
ARG DATABASE_URL=/tmp/build-placeholder.db
ENV DATABASE_URL=${DATABASE_URL}

COPY . .
RUN pnpm run build
RUN pnpm prune --prod

##############################################################################
# Stage 3: production runtime
# Minimal image: no package manager, no compilers, no source - just the
# adapter-node build output, pruned node_modules, and package.json (needed so
# Node resolves the build output's ESM "type": "module").
##############################################################################
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# node:*-alpine images ship an unprivileged "node" user (uid/gid 1000) -
# reuse it instead of running as root.
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 3000

CMD ["node", "build"]
