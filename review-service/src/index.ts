import { app } from './app';
import { PORT } from './config/env.variable';
import express from 'express';
import { logger } from './logs/logging';

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
    }
}

const server = async (PORT: number, app: express.Application) => await new Server(PORT, app).startServer();

server(PORT, app);