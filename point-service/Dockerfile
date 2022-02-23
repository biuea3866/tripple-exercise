FROM node:16

WORKDIR /point-service

COPY package*.json /point-service
COPY tsconfig.json /point-service
COPY /src /point-service/src

RUN npm install
RUN npm run tsc

CMD ["npm", "start"]

EXPOSE 6400