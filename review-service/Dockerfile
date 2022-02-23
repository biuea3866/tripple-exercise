FROM node:16

WORKDIR /review-service

COPY package*.json /review-service
COPY tsconfig.json /review-service
COPY /src /review-service/src

RUN npm install
RUN npm run tsc

CMD ["npm", "start"]

EXPOSE 6200