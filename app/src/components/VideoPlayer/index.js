import React						from 'react'

import BigPlayButton from './BigPlayButton'
import './sass/player.sass'

export default class VideoPlayer extends React.Component {
	render() {
		const { src, srcTrack, srcLang, label, requestMovie, isMovieRequested } = this.props
		return (
			<div className="playerContainer" onClick={requestMovie}>
				{(isMovieRequested && <video
					className="player"
					width="100%"
					height="100%"
					controls
					// autoPlay
				>
					<source src={src} type="video/ogg" />
					<track src={srcTrack} kind="subtitles" srcLang={srcLang} label={label} default />
				</video>) || <BigPlayButton />}
			</div>
		)
	}
}
