FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm install
COPY . .
RUN npm run build

CMD ["node", "/usr/src/app/dist/src/main.js"]
