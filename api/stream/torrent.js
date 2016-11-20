
const torrentRoute = (req, res, next) => {
    const movie = this.authorizeFileTransfert(req.body.movie || {})
    if (movie.success) {
        this.torrent(movie.data, next)
    } else {
        next()
    }
}

const authorizeFileTransfert = (movie) => {
    if (!!movie && true) { // should verify download conditions in database
        return {success: true, status: 'success', message: "torrent file should be downloaded", data: movie}
    } else return {success: false, status: 'error', message: "torrent file won't be downloaded", data: movie}
}

const torrent = (movie, next) => {
    // this downloads the movie to fs and updates database
    // then next() is called to start streaming process. next() call should happen when streaming process an be started
    // AND EXECUTED IN FULL without the need for some more buffering.
    
}