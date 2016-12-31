/**
 * Created by opichou on 11/21/16.
 */
 /* eslint semi: ["error", "never"]*/

 import MovieFile from './movieFile'

const streamRoute = (req, res) => {
	res.writeHead(200, { 'Content-Type': 'video/mp4' })
    const stream = new MovieFile({
		query: {
			path: './MovieLibrary/sample.mkv',
			name: 'test',
		},
	}).stream()
	stream.on('data', data => {
		res.write(data)
	})
	stream.on('end', () => {
		res.end()
	})
	stream.on('error', e => {
		console.log(e)
	})
}

export default streamRoute
