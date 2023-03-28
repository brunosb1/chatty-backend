import mongoose from 'mongoose';

export default () => {
    const connect = async () => {
        try {
            await mongoose.connect('mongodb://0.0.0.0:27017/chattyapp-backend');
            console.log('Mongo Connected');
        } catch (err) {
            console.log(err);
        }
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
