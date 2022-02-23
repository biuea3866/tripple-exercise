import express from 'express';
import { INTERNAL_SERVER_ERROR, OK } from '../constants/result.code';
import { GetHistoryDto } from '../interface/get.history.dto';
import { GetPointsDto } from '../interface/get.point.dto';
import { ResponseDto } from '../interface/response.dto';
import { PointService } from '../services/point.service';

class PointController {
    private service: PointService;

    constructor() {
        this.service = new PointService();
    }

    public async getPoints(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        try {
            const dto: GetPointsDto = {
                userId: request.params.userId
            };
            const result: ResponseDto = await this.service.getPoints(dto);
    
            
            return response.status(OK)
                           .json(result);
        } catch(e) {
            return response.status(INTERNAL_SERVER_ERROR)
                           .json({ message: JSON.stringify(e) });
        }
    }

    public async getHistory(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        try {
            const dto: GetHistoryDto = {
                userId: request.params.userId
            };
            const result: ResponseDto = await this.service.getHistory(dto);
    
            return response.status(OK)
                           .json(result);
        } catch(e) {
            return response.status(INTERNAL_SERVER_ERROR)
                           .json({ message: JSON.stringify(e) });
        }
    }
}

export { PointController };