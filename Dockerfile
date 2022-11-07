# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
COPY MORE-Platform-tm-openapi-client-typescript-1.0.0.tgz ./
RUN npm install
COPY . .
RUN npm run package

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY docker/nginx/*.conf.template /etc/nginx/templates/
EXPOSE 80

ENV MORE_API_ENDPOINT=https://mmb.more.redlink.io/api

CMD ["nginx", "-g", "daemon off;"]
