import { ResponseDto } from "../interface/response.dto";
import { SaveReviewDto } from "../interface/save.review.dto";
import express from 'express';
import { BAD_GATEWAY, CREATED, FAILURE_DELETE_REVIEW, FAILURE_GET_REVIEWS, FAILURE_MODIFY_REVIEW, FAILURE_SAVE_REVIEW, INTERNAL_SERVER_ERROR, NO_CONTENT, OK } from "../constants/result.code";
import { ReviewService } from "../services/review.service";
import { ModifyReviewDto } from "../interface/modify.review.dto";
import { DeleteReviewDto } from "../interface/delete.review.dto";

class ReviewController {
    private service: ReviewService;

    constructor() {
        this.service = new ReviewService();
    }

    public async getReviews (
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        try {
            const placeId: string = request.params.placeId;
            const result: ResponseDto = await this.service.getReviews(placeId);

            if(result.code === (BAD_GATEWAY || FAILURE_GET_REVIEWS)) {
                return response.status(BAD_GATEWAY)
                               .json(result.message);
            }

            return response.status(OK)
                           .json(result.payload);
        } catch(e) {
            return response.status(INTERNAL_SERVER_ERROR)
                           .json({ message: JSON.stringify(e) });
        }
    }

    public async saveReview (
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        try {
            const dto: SaveReviewDto = request.body;
            const result: ResponseDto = await this.service.saveReview(dto);
    
            if(result.code === (BAD_GATEWAY || FAILURE_SAVE_REVIEW)) {
                return response.status(BAD_GATEWAY)
                               .json(result.message);
            }

            return response.status(CREATED)
                           .json(result.message);
        } catch(e) {
            return response.status(INTERNAL_SERVER_ERROR)
                           .json({ message: JSON.stringify(e) });
        }
    };

    public async modifyReview (
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        try {
            const modifyReviewDto: ModifyReviewDto = {
                reviewId: request.params.reviewId,
                userId: request.body.userId,
                action: request.body.action,
                content: request.body.content,
                attachedPhotos: request.body.attachedPhotos
            };
            const result: ResponseDto = await this.service.modifyReview(modifyReviewDto);

            if(result.code === (BAD_GATEWAY || FAILURE_MODIFY_REVIEW)) {
                return response.status(BAD_GATEWAY)
                               .json(result.message);
            }
            
            return response.status(OK)
                           .json(result.message);
        } catch(e) {
            return response.status(INTERNAL_SERVER_ERROR)
                           .json({ message: JSON.stringify(e) });
        }
    }

    public async deleteReview (
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        try {
            const deleteReviewDto: DeleteReviewDto = {
                reviewId: request.params.reviewId,
                action: request.body.action,
                userId: request.body.userId,
            };

            const result: ResponseDto = await this.service.deleteReview(deleteReviewDto);

            if(result.code === (BAD_GATEWAY || FAILURE_DELETE_REVIEW)) {
                return response.status(BAD_GATEWAY)
                               .json(result.message);
            }

            return response.status(NO_CONTENT)
                           .json(result);
        } catch(e) {
            return response.status(INTERNAL_SERVER_ERROR)
                           .json({ message: JSON.stringify(e) });
        }
    }
}

export { ReviewController };