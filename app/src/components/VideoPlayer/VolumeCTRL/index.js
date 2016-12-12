import React			from 'react'

import IconButton		from 'material-ui/IconButton'

export default ({ volume, mainColor, onClick, onMouseDown, onRef, onMute }) =>
<div className="volumeContainer">
	<IconButton
		style={{ backgroundColor: mainColor }}
		className="volIco"
		onTouchTap={onMute}
	>
		<i className="material-icons">{
			(volume > 0.5 && 'volume_up') ||
			(volume <= 0.5 && volume > 0.1 && 'volume_down') ||
			'volume_mute'
		}</i>
	</IconButton>
	<div className="volBarContainer" ref={onRef}>
		<div
			className="volBar"
			style={{ backgroundColor: mainColor }}
			onClick={onClick}
		/>
		<div
			className="slidePoint"
			style={{
				backgroundColor: mainColor,
				top: `${volume * 100}%`,
			}}
			onMouseDown={onMouseDown}
		/>
	</div>
</div>
