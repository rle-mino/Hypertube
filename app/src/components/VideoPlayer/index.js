import React				from 'react'

import PlayPause			from '../PlayPause'

import './sass/player.sass'

export default class VideoPlayer extends React.Component {
	componentDidMount() { this._mounted = true }
	componentWillUnMount() { this._mounted = false }

	state = {
		playing: false,
		volume: localStorage.getItem('volume') || 0.5,
	}

	getPlayer = () => document.querySelector('.player')

	/*
	*	EVENT HANDLING
	*/
	canPlayThrough = () => {
		const player = this.getPlayer()
		player.volume = this.state.volume
		player.play()
		this.setState({ playing: true })
	}

	progress = () => {
		const player = this.getPlayer()
		let range = 0
    	const bf = player.buffered
    	const time = player.currentTime

    	while(!(bf.start(range) <= time && time <= bf.end(range))) {
        	range++
    	}
    	var loadStartPercentage = bf.start(range) / player.duration;
    	var loadEndPercentage = bf.end(range) / player.duration;
    	var loadPercentage = loadEndPercentage - loadStartPercentage;
		console.log(loadPercentage * 100)
	}

	play = () => this.setState({ playing: true })
	pause = () => this.setState({ playing: false })
	ended = () => this.setState({ playing: false })

	/*
	*	EVENT TRIGGERING
	*/
	playPause = () => {
		const player = this.getPlayer()
		if (player) player[player.paused ? 'play' : 'pause']()
	}

	render() {
		const { playing } = this.state
		const { mainColor } = this.props
		return (
			<div className="playerContainer">
				<div className="controls">
					<PlayPause
						onClick={this.playPause}
						playing={playing}
						mainColor={mainColor}
					/>
				</div>
				<video
					className="player"
					width="100%"
					height="100%"
					ref="player"
					onEnded={this.ended}
					onPlay={this.play}
					onPause={this.pause}
					onCanPlayThrough={this.canPlayThrough}
					onProgress={this.progress}
					controls={true}
				>
					<source
						src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
						type="video/mp4"
					/>
				</video>
			</div>
		)
	}
}
