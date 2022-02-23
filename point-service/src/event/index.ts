import { AMQP_HOST, REQUEST_DECREASE_POINT, REQUEST_INCREASE_POINT, RESPONSE_REVIEW } from "../config/env.variable";
import { EventBusSaga } from "./event.bus";

class Choreographer {
    static increasePointEvent: EventBusSaga = new EventBusSaga(REQUEST_INCREASE_POINT, AMQP_HOST);
    static responseReviewEvent: EventBusSaga = new EventBusSaga(RESPONSE_REVIEW, AMQP_HOST);
    static decreasePointEvent: EventBusSaga = new EventBusSaga(REQUEST_DECREASE_POINT, AMQP_HOST);
}

export { Choreographer };