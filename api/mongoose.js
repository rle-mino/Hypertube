// ssh 188.166.169.93 -l root : LeChatBleu
// sudo mongod --bind_ip 188.166.169.93

import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://188.166.169.93/hypertube');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('MongoDB connection established'));

export default mongoose;
