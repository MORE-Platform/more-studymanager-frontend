# build stage
FROM node:16.19.0-alpine as build-stage
RUN apk add openjdk8-jre
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run package:quick

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY docker/nginx/*.conf.template /etc/nginx/templates/
EXPOSE 80

ENV MORE_BACKEND_URL=https://studymanager.more.redlink.io/

CMD ["nginx", "-g", "daemon off;"]
