import React				from 'react'

/*
*	Referencing this component is nescessary
*	because the parent needs his position
*	to calculate the asked time
*/
export default ({ available, mainColor, currentTime, click, onMouseDown, onRef }) =>
	<div className="seekBar" ref={onRef}>
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
				left: `${currentTime - 1}%`,
			}}
		/>
	</div>
