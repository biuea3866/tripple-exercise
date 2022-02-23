import { IPhoto } from "./photo.interface";

interface ModifyReviewDto {
    userId: string,
    action: string,
    reviewId: string,
    content?: string,
    attachedPhotos?: string[]
}

export { ModifyReviewDto };