FROM node:22-alpine AS builder
WORKDIR /app

COPY . .

RUN npm i
RUN npm i tsup -D

RUN npx turbo run build --filter=api

RUN npx tsup apps/api/dist/index.js \
    --clean \
    --minify \
    --out-dir /app/dist/final

# STAGE 2: Run
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist/final/index.js .

EXPOSE 3000

CMD ["node", "index.js"]