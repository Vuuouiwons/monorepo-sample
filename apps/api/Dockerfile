FROM node:lts-trixie-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS build-base

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i -g turbo@^2

FROM build-base AS prepare

COPY . /app

RUN turbo prune api --docker

FROM build-base AS build

COPY --from=prepare /app/out/json/ .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY --from=prepare /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm run build

FROM build AS artifacts

WORKDIR /runtime/packages

RUN for pkg in /app/packages/*; do \
      if [ -d "$pkg/dist" ]; then \
        name=$(basename "$pkg"); \
        mkdir -p "/runtime/packages/$name"; \
        cp -r "$pkg/dist" "/runtime/packages/$name/dist"; \
        cp "$pkg/package.json" "/runtime/packages/$name/package.json"; \
      fi \
    done


FROM base AS prod

COPY --from=prepare /app/out/json /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

COPY --from=build /app/apps/api/dist ./apps/api/dist
# COPY --from=build /app/packages ./packages
COPY --from=artifacts /runtime/packages ./packages

EXPOSE 3000

CMD ["node", "/app/apps/api/dist/index.js"]
# # CMD ["sleep", "1234"]