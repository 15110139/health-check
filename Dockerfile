FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ARG ZOOKEEPER_HOST=0.0.0.0:2181

ENV ZOOKEEPER_HOST=${ZOOKEEPER_HOST}

CMD [ "npm", "start" ]