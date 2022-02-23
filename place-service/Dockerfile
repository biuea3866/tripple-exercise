FROM node:16

WORKDIR /place-service

COPY package*.json /place-service
COPY tsconfig.json /place-service
COPY /src /place-service/src

RUN npm install
RUN npm run tsc

CMD ["npm", "start"]

EXPOSE 6200