FROM node:14-alpine

WORKDIR /usr/app
COPY yarn.lock package.json ./
RUN yarn install --quiet
COPY . .
RUN yarn run tsc
RUN yarn run build
