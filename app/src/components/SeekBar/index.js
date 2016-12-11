import React				from 'react'

export default ({ available, mainColor, currentTime, click, onMouseDown }) =>
	<div className="seekBar">
		<div className="seekProgress"
			onClick={click}
			style={{
				width: `${available}%`,
				backgroundColor: mainColor,
			}}
		/>
		<div
			className="seekPoint"
			onMouseDown={onMouseDown}
			style={{
				backgroundColor: mainColor,
				left: `${currentTime}%`
			}}
		/>
	</div>
