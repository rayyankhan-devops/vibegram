FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci

COPY . .

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine-slim 

USER root 

RUN addgroup -S vibegramfe && adduser -S vibegramfe -G vibegramfe

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

USER vibegramfe

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]