import express, { Router } from 'express';
import { PointController } from './point.routes';

const router: Router = express.Router();
const controller: PointController = new PointController();

router.get('/points/:userId', async (
    request: express.Request,
    response: express.Response
) => await controller.getPoints(
    request,
    response
));

router.get('/history/:userId', async (
    request: express.Request,
    response: express.Response
) => await controller.getHistory(
    request,
    response
));

export { router };