import React					from 'react'

import IconClickable	from '../IconClickable'

const iconStyle = {
	backgroundColor: 'white',
	borderRadius: '50%',
	width: '130px',
	height: '130px',
	boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
}

const BigPlayButton = () =>
	<div className="bigPlayButton player">
		<IconClickable style={iconStyle}>
			<i className="material-icons">play_circle_filled</i>
		</IconClickable>
	</div>

export default BigPlayButton