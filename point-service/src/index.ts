import { app } from './app';
import { PORT } from './config/env.variable';
import express from 'express';
import { logger } from './logs/logging';
import { Choreographer } from './event';

class Server {
    private PORT: number;
    private app: express.Application;

    constructor(
        PORT: number,
        app: express.Application
    ) {
        this.PORT = PORT;
        this.app = app;
    }

    public async startServer(): Promise<void> {
        this.app.listen(this.PORT, () => {
            logger.info(`Running Server on ${this.PORT}`);
        });

        await Choreographer.increasePointEvent.subscribeFromQueue();

        await Choreographer.decreasePointEvent.subscribeFromQueue();
    }
}

const server = async (PORT: number, app: express.Application) => await new Server(PORT, app).startServer();

server(PORT, app);