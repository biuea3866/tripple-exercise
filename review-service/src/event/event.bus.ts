import { logger } from '../logs/logging';
import { EventMessage } from '../interface/event.message.interface';
import { connection } from './client';
import { Channel, GetMessage } from 'amqplib';
import { RESPONSE_REVIEW } from '../config/env.variable';

class EventBusSaga {
    private hostName: string;
    private channelName: string;
    private client: Channel;

    constructor(
        channelName: string,
        hostName: string    
    ) {
        this.channelName = channelName;
        this.hostName = hostName;
    }

    public async setUp(): Promise<void> {
        this.client = await (await connection(this.hostName)).createChannel();
    }

    public async assertQueue(): Promise<void> {
        await this.client.assertQueue(this.channelName, {
            durable: false
        });
    }

    public async publishToQueue(eventMessage: EventMessage): Promise<boolean> {
        await this.setUp();
        await this.assertQueue();

        const sending = this.client.sendToQueue(
            this.channelName,
            Buffer.from(JSON.stringify(eventMessage)), {
                persistent: true
            }
        );

        return sending;
    }

    public async subscribeFromQueue(): Promise<void> {
        await this.setUp();

        await this.client.consume(this.channelName, (responseMessage) => {
            this.client.ack(responseMessage);

            const eventMessage: EventMessage = JSON.parse(responseMessage.content.toString());

            switch(this.channelName) {
                case RESPONSE_REVIEW: {
                    break;
                }
                default: logger.info("Subscribing: " + this.channelName);
            }
        });
    }

    public async consumeFromQueue(): Promise<EventMessage> {
        await this.setUp();

        const message: boolean | GetMessage = await this.client.get(this.channelName);

        if(message) {
            this.client.ack(message);
            
            return JSON.parse(message.content.toString());
        }

        return null;
    }
}

export { EventBusSaga };