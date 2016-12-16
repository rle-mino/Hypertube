import React				from 'react'
import mouseTrap			from 'mousetrap'
import * as pending			from '../../action/pending'

import PlayPause			from './PlayPause'
import SeekBar				from './SeekBar'
import FullScreenButton		from './FullScreenButton'
import Timer				from './Timer'
import VolumeCTRL			from './VolumeCTRL'

import './sass/player.sass'

export default class VideoPlayer extends React.Component {
	state = {
		playing: false,
		currentTime: 0,
		completeCurrentTime: 0,
		completeDuration: 0,
		volume: 0.5,
		mute: false,
		oldVol: 0,
		available: 0,
		mouseDown: false,
		draggingSeek: false,
		draggingVol: false,
		fullscreen: false,
	}

	_player = null
	_container = null
	_seekBar = null
	_volBar = null

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
		this.props.dispatch(pending.set())
		mouseTrap.bind('space', (e) => this.playPause(e))
	}

	componentWillUnmount() {
		this._mounted = false
		clearInterval(this.interval)
		mouseTrap.reset()
	}

	toggleFullScreen = () => {
		const { _container } = this
		const { fullscreen } = this.state

		if (!_container) return false
		if (!fullscreen) {
			if (_container.requestFullScreen) {
				_container.requestFullScreen()
			} else if (_container.mozRequestFullScreen) {
				_container.mozRequestFullScreen()
			} else if (_container.webkitRequestFullScreen) {
				_container.webkitRequestFullScreen()
			}
			this.setState({ fullscreen: true })
		} else {
			if (document.cancelFullScreen) {
				document.cancelFullScreen()
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen()
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen()
			}
			this.setState({ fullscreen: false })
		}
	}

	/*
	*	Updates the currentTime using the seekBar
	*/
	setNewTime = (clientX) => {
		const { _player, _seekBar } = this
		if (!_player || !_seekBar) return false

		/* get position / width of the seekBar */
		const progressRect = _seekBar.getBoundingClientRect()
		const startPixel = +progressRect.left
		const endPixel = +progressRect.right
		const width = progressRect.width

		/* stops if client is pointing out of the seekBar */
		if (clientX > endPixel) return false

		/* calculate where the client is */
		const clickPoint = +clientX - +startPixel
		let clickPointPercent = (clickPoint / width) * 100
		if (clickPointPercent < 0) clickPointPercent = 0

		/* updates */
		_player.currentTime = _player.duration * (clickPointPercent / 100)
		const currentTime = (_player.currentTime * 100) / _player.duration
		this.setState({ currentTime })
	}

	/*
	*	Updates the volume using de volBar
	*/
	setNewVolume = (clientY) => {
		const { _volBar, _player } = this
		if (!_volBar || !_player) return false

		/* get position and height of volBar */
		const volRect = _volBar.getBoundingClientRect()
		const startPixel = volRect.top
		const endPixel = volRect.bottom
		const height = +volRect.height

		/*
		*	if the client is out of the volBar
		*	we directly set to volume to the extrem
		*/
		if (clientY < startPixel) {
			this.setState({ volume: 0 })
			return true
		} else if (clientY > endPixel) {
			this.setState({ volume: 1 })
			return true
		}

		/* calculates where the client is */
		const clickPoint = +clientY - +startPixel
		let clickPointPercent = (clickPoint / height) * 100
		if (clickPointPercent < 0) clickPointPercent = 0
		if (clickPointPercent > 100) clickPointPercent = 1

		/* updates */
		_player.volume = clickPointPercent / 100.000
		this.setState({ volume: clickPointPercent / 100, mute: false })
	}

	mute = () => {
		const { _player } = this
		if (this.state.mute) {
			this.setState({
				mute: false,
				volume: this.state.oldVol,
			})
			_player.volume = this.state.oldVol
		} else {
			this.setState({
				mute: true,
				oldVol: this.state.volume,
				volume: 0,
			})
			_player.volume = 0
		}
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
		this.props.dispatch(pending.unset())
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
	*	Fires when the volume changes in fullscreen
	*	to keep sync the custom volume slider with
	*	the actual volume
	*/
	volumeChange = () => this.setState({ volume: this._player.volume })

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
	playPause = (e) => {
		if (e) {
			e.stopPropagation()
			e.preventDefault()
		}

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
		else if (this.state.draggingVol) this.setNewVolume(e.clientY, e.target)
		else return false
	}

	/*
	*	Re-calculate the currentTime
	*	when the user clicks over the seekBar
	*/
	seekClick = (e) => {
		e.preventDefault()
		this.setNewTime(e.clientX)
	}

	/*
	*	Re-calculate the volume
	*	when the user clicks over the volBar
	*/
	volClick = (e) => {
		e.preventDefault()
		this.setNewVolume(e.clientY)
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
				style={fullscreen ? { width: '100%', height: '100%', background: 'black' } : {}}
				onMouseUp={this.onMouseUp}
				onMouseMove={this.onMouseMove}
				ref={(container) => this._container = container}
			>
				<div className="controls" onDoubleClick={this.toggleFullScreen}>
					<VolumeCTRL
						volume={volume}
						mainColor={mainColor}
						onClick={this.volClick}
						onMute={this.mute}
						onMouseDown={this.onMouseDownVol}
						onRef={(volBar) => this._volBar = volBar}
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
							enabled={fullscreen}
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
					onVolumeChange={this.volumeChange}
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
