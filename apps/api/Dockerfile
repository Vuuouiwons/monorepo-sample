# STAGE 1: Prune
FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

FROM node:22-alpine AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN npm install

# STAGE 3: Build & Run
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app .

COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/tsconfig.base.json .

RUN npm run build


CMD ["node", "apps/api/dist/index.js"]
