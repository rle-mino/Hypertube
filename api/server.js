import express					from 'express';
import path							from 'path';
import bodyParser				from 'body-parser';
import cors							from 'cors';
import user							from './routers/user';
import movie						from './routers/movie';
import stream						from './routers/stream';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${__dirname}/public`));
app.use(express.static(path.resolve(__dirname, 'build')));

user(app);
movie(app);
stream(app);

app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'build', 'index.html')));
app.listen(8080, () => console.log('SERVER STARTED ON PORT 8080'));
