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

    public startServer(): void {
        this.app.listen(this.PORT, () => {
            logger.info(`Running Server on ${this.PORT}`);
        });
    }
}

const server: Server = new Server(PORT, app);

server.startServer();

export default server;