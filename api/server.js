import express						from 'express';
import bodyParser					from 'body-parser';
import cors							from 'cors';
import user							from './routers/user';
import movie						from './routers/movie';
import stream						from './routers/stream';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${__dirname}/public`));

// user(app);
movie(app);
stream(app);

app.listen(8080, () => console.log('SERVER STARTED'));
