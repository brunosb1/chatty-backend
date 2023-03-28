import mongoose from 'mongoose';
import { config } from './config';

export default () => {
    const connect = async () => {
        try {
            await mongoose.connect(`${config.DATABASE_URL}`);
            console.log('Mongo Connected');
        } catch (err) {
            console.log(err);
        }
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
