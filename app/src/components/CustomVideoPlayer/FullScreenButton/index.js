import React			from 'react'

import IconButton		from 'material-ui/IconButton'

export default ({ enabled, mainColor, onTouchTap }) =>
	<IconButton
		style={{
			color: mainColor,
			padding: '5px',
			margin: '0 5px'
		}}
		iconStyle={{
			fontSize: '40px',
		}}
		onTouchTap={onTouchTap}
	>
		<i className="material-icons">
			{enabled ? 'fullscreen_exit' : 'fullscreen'}
		</i>
	</IconButton>
