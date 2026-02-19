FROM node:lts-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i -g turbo@^2

WORKDIR /app

FROM base AS prepare

COPY . /app

RUN turbo prune web --docker

FROM base AS build

COPY --from=prepare /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY --from=prepare /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm run build

FROM nginx:1-alpine

COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]