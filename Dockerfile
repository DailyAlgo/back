FROM node:16-alpine3.14

RUN mkdir -p /app
WORKDIR /app

ADD . .

RUN apk update && apk add bash && apk add curl

RUN yarn install && yarn build

ENTRYPOINT ["node", "dist/index.js"]

EXPOSE 3306