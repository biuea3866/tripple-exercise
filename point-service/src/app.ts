import bodyParser from "body-parser";
import compression from 'compression';
import express from 'express';
import { router } from './routes/index';

const app: express.Application = express();

app.use(bodyParser.json());

app.use(compression());

app.use("/", router);

export { app };