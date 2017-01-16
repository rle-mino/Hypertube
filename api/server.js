import 'dotenv/config';
import express						from 'express';
import path							from 'path';
import bodyParser					from 'body-parser';
import cors							from 'cors';
import user							from './routers/user';
import movie						from './routers/movie';
// import stream						from './routers/stream';

import torrentStream from 'torrent-stream';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${__dirname}/public`));
app.use(express.static(path.resolve(__dirname, 'build')));

user(app);
movie(app);
// stream(app);

app.get('/api/test', (req, res) => {
  const magnet = 'magnet:?xt=urn:btih:23B285BB637497E673A6013B19119E77BD713AAD&dn=Sully&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce&xl=748316262';

  const engine = torrentStream(magnet);
  engine.on('ready', () => {
    const stream = engine.files[1].createReadStream();
    stream.on('data', (data) => {
      res.write(data);
      console.log(data);
    });

      // engine.files.forEach((file) {
      //     console.log('filename:', file.name);
      //     var stream = file.createReadStream();
      //     // stream is readable stream to containing the file content
      // });
  });
});
app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'build', 'index.html')));
app.listen(process.env.SERVER_PORT, () => console.log('SERVER STARTED')); // eslint-disable-line no-console
