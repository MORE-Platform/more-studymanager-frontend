# build stage
FROM node:18-alpine as build-stage
RUN apk add openjdk17-jre-headless
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_GIT_BRANCH
ARG VITE_GIT_REVISION
RUN npm run package:quick

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY docker/nginx/*.conf.template /etc/nginx/templates/
EXPOSE 80

ENV MORE_BACKEND_URL=https://studymanager.more.redlink.io/

CMD ["nginx", "-g", "daemon off;"]
