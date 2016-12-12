import React				from 'react'

const play = "M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26"
const pause = "M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28"

export default class PlayPause extends React.Component {
	componentWillReceiveProps = (newProps) => {
		if (newProps.playing !== this.props.playing) {
			const animate = document.querySelector('.playPauseAn')
			if (animate) animate.beginElement()
		}
	}

	render() {
		const { onClick, playing, mainColor } = this.props
		return (
			<button
				className="ytp-play-button ytp-button"
				aria-live="assertive"
				tabIndex="32"
				aria-label="Pause"
				onClick={onClick}
				style={{ backgroundColor: mainColor }}
			>
			   <svg
				   width="100%"
				   height="100%"
				   viewBox="0 0 36 36"
				   version="1.1"
				   xmlns="http://www.w3.org/2000/svg"
				   xmlnsXlink="http://www.w3.org/1999/xlink"
				>
			      <defs>
			         <path id="ytp-12" d={play}>
			            <animate
							id="animation"
							className="playPauseAn"
							begin="indefinite"
							attributeType="XML"
							attributeName="d"
							fill="freeze"
							from={playing ? pause : play}
							to={playing ? play : pause}
							dur="0.2s"
							keySplines=".4 0 1 1"
							repeatCount="1"
						/>
			         </path>
			      </defs>
			      <use xlinkHref="#ytp-12" className="ytp-svg-shadow" />
			      <use xlinkHref="#ytp-12" className="ytp-svg-fill" />
			   </svg>
			</button>
		)
	}
}
