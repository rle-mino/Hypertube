import React				from 'react'

import PlayPause			from '../PlayPause'
import SeekBar				from '../SeekBar'
import FullScreenButton		from '../FullScreenButton'
import Timer				from '../Timer'
import VolumeCTRL			from '../VolumeCTRL'

import './sass/player.sass'

export default class VideoPlayer extends React.Component {
	state = {
		playing: false,
		currentTime: 0,
		completeCurrentTime: 0,
		completeDuration: 0,
		volume: localStorage.getItem('volume') || 0.5,
		available: 0,
		mouseDown: false,
		draggingSeek: false,
		draggingVol: false,
		fullscreen: false,
	}

	_player = null
	_seekBar = null

	/*
	*	triggered every seconds,
	*	this function updates the currentTime
	*	and the available part of the video
	*/
	updateVideoData = () => {
		const { _player } = this

		/*
		*	get the currentTime
		*	the currentTime is the current playback
		*	position in the video in percent
		*/
		const currentTime = (_player.currentTime * 100) / _player.duration

		/*
		*	get the completeCurrentTime
		*	the completeCurrentTime is the currentTime formatted
		*	like 01:25
		*/
		const curmins = Math.floor(_player.currentTime / 60);
		const cursecs = Math.floor(_player.currentTime - curmins * 60);
		const completeCurrentTime =
			`${curmins < 10 ? '0' : ''}${curmins}:${cursecs < 10 ? '0' : ''}${cursecs}`

		/*
		*	get the completeDuration
		*	the completeDuration is the duration formatted
		*	like 01:25
		*/
		const durmins = Math.floor(_player.duration / 60);
		const dursecs = Math.floor(_player.duration - durmins * 60);
		const completeDuration = `${durmins < 10 ? '0' : ''}${durmins}:${dursecs}`

		this.setState({ currentTime, completeCurrentTime, completeDuration })

		/*
		*	get the last buffered timeRange of the video
		*	and save it to the state to updates the seekBar width
		*	will be uncommented when we find a more stable solution
		*/
		// if (_player.readyState === 4 && this.state.available <= 99) {
		// 	let range = 0
		// 	const bf = _player.buffered
		// 	const time = _player.currentTime
		//
		// 	try {
		// 		while (!(bf.start(range) <= time && time <= bf.end(range))) {
		// 			range++
		// 		}
		// 		const loadEndPercentage = bf.end(range) / _player.duration;
		// 		this.setState({ available: loadEndPercentage * 100 })
		// 	} catch (e) {
		// 		console.log(e)
		// 	}
		// }
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
		const { _player, _seekBar } = this
		if (!_player || !_seekBar) return false
		/* required if target = the play/pause SVG button */
		if (!target || !target.className || !target.className.includes) return false

		/* get position of the seekBar */
		const progressRect = _seekBar.getBoundingClientRect()

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
		if (clickPointPercent < 0) clickPointPercent = 0
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
			/*
			*	set the available to 100 until we find a stable solution
			*	to get the buffered range of the video
			*/
			this.setState({ playing: true, available: 100 })
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
	*	These functions trigger 'draggingVol' or 'draggingSeek' in the state
	*/
	onMouseDownSeek = (e) => {
		if (e.button !== 0) return false
		this.setState({ draggingSeek: true })

		e.stopPropagation()
		e.preventDefault()
	}
	onMouseDownVol = (e) => {
		if (e.button !== 0) return false
		this.setState({ draggingVol: true })

		e.stopPropagation()
		e.preventDefault()
	}

	onMouseUp = (e) => {
		this.setState({
			draggingSeek: false,
			draggingVol: false,
		})
		e.stopPropagation()
		e.preventDefault()
	}

	/*
	*	When dragging is true, we re-calculate
	*	the currentTime or the volume
	*/
	onMouseMove = (e) => {
		if (this.state.draggingSeek) this.setNewTime(e.clientX, e.target)
		else if (this.state.draggingVol) this.setNewVol(e.clientY, e.target)
		else return false
	}

	/*
	*	Re-calculate the currentTime
	*	when the user clicks over the seekBar
	*/
	seekClick = (e) => {
		e.preventDefault()

		this.setNewTime(e.clientX, e.target)
	}

	toggleFullScreen = () => {
		if (this._player.requestFullScreen) {
			this._player.requestFullScreen()
		} else if (this._player.mozRequestFullScreen) {
			this._player.mozRequestFullScreen()
		} else if (this._player.webkitRequestFullScreen) {
			this._player.webkitRequestFullScreen()
		}
	}

	render() {
		const {
			playing,
			available,
			currentTime,
			completeCurrentTime,
			completeDuration,
			fullscreen,
			volume,
		} = this.state
		const { mainColor } = this.props
		return (
			<div className="playerContainer"
				onMouseUp={this.onMouseUp}
				onMouseMove={this.onMouseMove}
			>
				<div className="controls">
					<VolumeCTRL
						volume={volume}
						mainColor={mainColor}
					/>
					<div className="bot">
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
							onMouseDown={this.onMouseDownSeek}
							onRef={(seekBar) => this._seekBar = seekBar}
						/>
						<Timer
							currentTime={completeCurrentTime}
							duration={completeDuration}
							mainColor={mainColor}
						/>
						<FullScreenButton
							enbabled={fullscreen}
							mainColor={mainColor}
							onTouchTap={this.toggleFullScreen}
						/>
					</div>
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
						src="http://www.supportduweb.com/page/media/videoTag/BigBuckBunny.ogg"
						type="video/ogg"
					/>
				</video>
			</div>
		)
	}
}
