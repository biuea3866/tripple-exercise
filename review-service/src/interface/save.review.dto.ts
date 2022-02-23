interface SaveReviewDto {
    type: string,
    action: string,
    content: string,
    attachedPhotos: string[],
    userId: string,
    placeId: string
};

export { SaveReviewDto };