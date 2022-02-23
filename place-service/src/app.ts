import bodyParser from "body-parser";
import compression from 'compression';
import express from 'express';

const app: express.Application = express();

app.use(bodyParser.json());

app.use(compression());

export { app };