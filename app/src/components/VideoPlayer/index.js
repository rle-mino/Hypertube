import React				from 'react'

import PlayPause			from '../PlayPause'
import SeekBar				from '../SeekBar'

import './sass/player.sass'

export default class VideoPlayer extends React.Component {
	state = {
		playing: false,
		currentTime: 0,
		volume: localStorage.getItem('volume') || 0.5,
		available: 0,
		mouseDown: false,
		dragging: false,
	}

	_player = null

	/*
	*	triggered every seconds,
	*	this function updates the currentTime
	*	and the available part of the video
	*/
	updateVideoData = () => {
		const { _player } = this
		if (this.state.available >= 98) this.setState({ available: 100 })

		/* updates the currentTime */
		const currentTime = (_player.currentTime * 100) / _player.duration
		this.setState({ currentTime })

		/*
		*	get the last buffered timeRange of the video
		*	and save it to the state to updates the seekBar width
		*/
		if (_player.readyState === 4 && this.state.available <= 99) {
			let range = 0
			const bf = _player.buffered
			const time = _player.currentTime

			while(!(bf.start(range) <= time && time <= bf.end(range))) {
				range++
			}
			const loadEndPercentage = bf.end(range) / _player.duration;
			this.setState({ available: loadEndPercentage * 100 })
		}
	}

	componentDidMount() {
		this._mounted = true
		this.interval = setInterval(this.updateVideoData, 1000)
	}

	componentWillUnmount() {
		this._mounted = false
		clearInterval(this.interval)
	}


	/*
	*	Update the currentTime using the seekBar
	*/
	setNewTime = (clientX, target) => {
		let progressRect;
		const { _player } = this
		if (!_player) return false
		/* required if target = the play/pause SVG button */
		if (!target || !target.className || !target.className.includes) return false

		/* get position of the seekBar */
		if (target.className.includes('seekBar')) {
			progressRect = target.getBoundingClientRect()
		} else {
			progressRect = target.parentNode.getBoundingClientRect()
		}

		/* get start/end pixel from seekBar */
		const startPixel = +progressRect.left
		const endPixel = +progressRect.right
		/* stops if client is pointing after the seekBar */
		if (clientX > endPixel) return false

		const width = progressRect.width
		/* get the number of pixels from the starting point */
		const clickPoint = +clientX - +startPixel
		/* from pixels to percent */
		let clickPointPercent = ((clickPoint / width) * 100)
		/* remove a percent to prevent the seekPoint with | UX++ */
		clickPointPercent -= (clickPointPercent ? 1 : 0)
		/* updates the currentTime */
		_player.currentTime = _player.duration * (clickPointPercent / 100)

		/* force the update of state.currentTime immediately | UX++ */
		const currentTime = (_player.currentTime * 100) / _player.duration
		this.setState({ currentTime })
	}

	/*
	*	EVENT HANDLING
	*/

	/*
	*	Fires when the browser can play through the audio/video
	*	without stopping for buffering,
	*	it start the video and set the volume
	*/
	canPlayThrough = () => {
		const { _player } = this
		if (_player) {
			_player.volume = this.state.volume
			_player.play()
			this.setState({ playing: true })
		}
	}

	/*
	*	The play/pause status is stored in the state to
	*	sync the play/pause button with _player
	*/
	play = () => this.setState({ playing: true })
	pause = () => this.setState({ playing: false })
	ended = () => this.setState({ playing: false })

	/*
	*	EVENT TRIGGERING
	*/
	playPause = () => {
		const { _player } = this
		if (_player) _player[_player.paused ? 'play' : 'pause']()
	}

	/*
	*	These functions trigger 'dragging' in the state
	*/
	onMouseDown = (e) => {
		if (e.button !== 0) return false
		this.setState({ dragging: true })

		e.stopPropagation()
		e.preventDefault()
	}
	onMouseUp = (e) => {
		this.setState({ dragging: false })

		e.stopPropagation()
		e.preventDefault()
	}

	/*
	*	When dragging is true, we re-calculate the currentTime
	*/
	onMouseMove = (e) => {
		if (!this.state.dragging) return false

		this.setNewTime(e.clientX, e.target)
	}

	/*
	*	Re-calculate the currentTime
	*	when the user clicks over the seekBar
	*/
	seekClick = (e) => {
		e.preventDefault()

		this.setNewTime(e.clientX, e.target)
	}

	render() {
		const { playing, available, currentTime } = this.state
		const { mainColor } = this.props
		return (
			<div className="playerContainer"
				onMouseUp={this.onMouseUp}
				onMouseMove={this.onMouseMove}
			>
				<div className="controls">
					<PlayPause
						onClick={this.playPause}
						playing={playing}
						mainColor={mainColor}
					/>
					<SeekBar
						available={available}
						mainColor={mainColor}
						currentTime={currentTime}
						click={this.seekClick}
						onMouseDown={this.onMouseDown}
					/>
				</div>
				<video
					className="player"
					width="100%"
					height="100%"
					ref={(player) => this._player = player}
					onEnded={this.ended}
					onPlay={this.play}
					onPause={this.pause}
					onCanPlayThrough={this.canPlayThrough}
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
