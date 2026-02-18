FROM node:lts-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g turbo
RUN npm install

RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]