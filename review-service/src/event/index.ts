import { RESPONSE_REVIEW, AMQP_HOST, REQUEST_INCREASE_POINT, REQUEST_DECREASE_POINT } from "../config/env.variable";
import { EventBusSaga } from "./event.bus";

class Choreographer {
    static responseReviewEvent = new EventBusSaga(RESPONSE_REVIEW, AMQP_HOST);
    static increasePointEvent = new EventBusSaga(REQUEST_INCREASE_POINT, AMQP_HOST);
    static decreasePointEvent = new EventBusSaga(REQUEST_DECREASE_POINT, AMQP_HOST);
}

export { Choreographer };