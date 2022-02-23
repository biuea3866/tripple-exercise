import express, { Router } from 'express';
import { ReviewController } from './review.routes';

const router: Router = express.Router();
const controller: ReviewController = new ReviewController();

router.get('/reviews/:placeId', async (
    request: express.Request,
    response: express.Response
) => await controller.getReviews(
    request,
    response
));

router.post('/events', async (
    request: express.Request,
    response: express.Response
) => await controller.saveReview(
    request,
    response
));

router.put('/events/:reviewId', async (
    request: express.Request,
    response: express.Response
) => await controller.modifyReview(
    request,
    response
));

router.delete("/events/:reviewId", async (
    request: express.Request,
    response: express.Response
) => await controller.deleteReview(
    request,
    response
));

export { router };