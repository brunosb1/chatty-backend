import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookierSessions from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';

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
                keys: ['test1', 'test2'],
                maxAge: 24 * 7 * 3600000,
                secure: false
            })
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                origin: '*',
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
         this.startHttpServer(httpServer);
        } catch (err) {
            console.log('error', err);
        }
    }

    private createSocketIO(httpServer: http.Server): void{}

    private startHttpServer(httpServer: http.Server): void{
        httpServer.listen(SERVER_PORT, () => {
            console.log(`server listening on port ${SERVER_PORT}`);
        })
    }
}
