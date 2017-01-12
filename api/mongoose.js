import 'dotenv/config';
import mongoose from 'mongoose';

let myMongoose = null;

const setupMongoose = () => {
	mongoose.Promise = global.Promise;
	mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@188.166.169.93/hypertube`);
	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:')); // eslint-disable-line no-console
	db.once('open', () => console.log('MongoDB connection established')); // eslint-disable-line no-console
	myMongoose = mongoose;
};

if (!myMongoose) setupMongoose();

export default myMongoose;
