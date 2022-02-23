import { PlaceRepository } from "../repository/place.repository";

class PlaceService {
    private respository: PlaceRepository;

    constructor() {
        this.respository = new PlaceRepository();
    }
}

export { PlaceService };