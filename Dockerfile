# build stage
FROM node:22-alpine as build-stage
RUN apk add openjdk17-jre-headless
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_GIT_BRANCH
ARG VITE_GIT_REVISION
ARG BACKEND_URL=https://studymanager.platform-test.more.redlink.io/
ARG KEYCLOAK_URL=https://auth.more.redlink.io
ARG KEYCLOAK_REALM=Auth-Client-Test
ARG KEYCLOAK_CLIENTID=oauth2-pkce-client
RUN npm run package:quick

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY docker/nginx/*.conf.template /etc/nginx/templates/
EXPOSE 80

ARG BACKEND_URL=https://studymanager.platform-test.more.redlink.io/
ENV BACKEND_URL=$BACKEND_URL
ARG KEYCLOAK_URL=https://auth.more.redlink.io
ENV KEYCLOAK_URL=$KEYCLOAK_URL
ARG KEYCLOAK_REALM=Auth-Client-Test
ENV KEYCLOAK_REALM=$KEYCLOAK_REALM
ARG KEYCLOAK_CLIENTID=oauth2-pkce-client
ENV KEYCLOAK_CLIENTID=$KEYCLOAK_CLIENTID

CMD ["nginx", "-g", "daemon off;"]
