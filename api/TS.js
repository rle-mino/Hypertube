var torrentStream = require('torrent-stream');

const magnet = 'magnet:?xt=urn:btih:23B285BB637497E673A6013B19119E77BD713AAD&dn=Sully&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce&xl=748316262';


var engine = torrentStream(magnet);

engine.on('ready', function(res) {
    engine.files.forEach(function(file) {
        console.log('filename:', file.name);
        var stream = file.createReadStream();
        // stream is readable stream to containing the file content
        stream.on('data', function(data) {
          console.log(data);
        })
    });
});
//
// engine.on('download', function() {
//   console.log(engine.swarm.downloaded);
//   engine.files.forEach(function(file) {
//       console.log('filename:', file.name);
//       var stream = file.createReadStream();
//       // stream is readable stream to containing the file content
//   });
// });
