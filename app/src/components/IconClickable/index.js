import React			from 'react'

import IconButton		from 'material-ui/IconButton'


export default ({ click, children, className, style }) =>
	<div className="iconContainer">
		<IconButton onTouchTap={click} className={className} style={style}>
			{children}
		</IconButton>
	</div>
