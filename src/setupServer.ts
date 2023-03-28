import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import { config } from './config';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import cookierSessions from 'cookie-session';
import 'express-async-errors';
import HTTP_STATUS from 'http-status-codes';

const SERVER_PORT = 5000;

export class ChattyServer {
    private app: Application;

    constructor(app: Application){
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app)
        this.standartMiddleware(this.app)
        this.routesMiddleware(this.app)
        this.globalErrorHandler(this.app)
        this.startServer(this.app)
    }

    private securityMiddleware(app: Application): void{
        app.use(
            cookierSessions({
                name: 'session',
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== 'development'
            })
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                origin: config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            })
        );
    }

    private standartMiddleware(app: Application): void{
        app.use(json({  limit: '50mb' }));
        app.use(urlencoded({ extended: true, limit: '50mb' }))
    }
    private routesMiddleware(app: Application): void{}

    private globalErrorHandler(app: Application): void{}

    private async startServer(app: Application): Promise<void>{
        try {
         const httpServer: http.Server = new http.Server(app);
         const SocketIO: Server = await this.createSocketIO(httpServer)
         this.startHttpServer(httpServer);
        } catch (err) {
            console.log('error', err);
        }
    }

    private async createSocketIO(httpServer: http.Server): Promise<Server>{
        const io: Server = new Server(httpServer, {
            cors: {
            origin: config.CLIENT_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }
        });
        const pubClient = createClient({ url: config.REDIS_SERVER });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        return io;
    }

    private startHttpServer(httpServer: http.Server): void{
        httpServer.listen(SERVER_PORT, () => {
            console.log(`server listening on port ${SERVER_PORT}`);
        })
    }
}
