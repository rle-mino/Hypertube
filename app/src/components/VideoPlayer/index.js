import React						from 'react'

import './sass/player.sass'

export default class VideoPlayer extends React.Component {
	render() {
		const { src, srcTrack, srcLang, label, requestMovie } = this.props
		return (
			<div className="playerContainer" onClick={requestMovie}>
				<video
					className="player"
					width="100%"
					height="100%"
					controls
				>
					<source src={src} type="video/ogg" />
					<track src={srcTrack} kind="subtitles" srcLang={srcLang} label={label} default />
				</video>
			</div>
		)
	}
}
