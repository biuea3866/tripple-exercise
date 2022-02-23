interface IReview {
    type: string,
    action: string,
    reviewId: string,
    content: string,
    userId: string,
    placeId: string,
    id: number
};

export { IReview };