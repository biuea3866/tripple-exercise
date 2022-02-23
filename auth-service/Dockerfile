FROM node:16

WORKDIR /auth-service

COPY package*.json /auth-service
COPY tsconfig.json /auth-service
COPY /src /auth-service/src

RUN npm install
RUN npm run tsc

CMD ["npm", "start"]

EXPOSE 6100