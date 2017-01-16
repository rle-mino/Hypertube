import React			from 'react'

import IconButton		from 'material-ui/IconButton'

export default ({ click, children, className, style, tooltip }) =>
	<div className="iconContainer">
		<IconButton
			onTouchTap={click}
			className={className}
			style={style}
			tooltipPosition="top-left"
			tooltip={tooltip}
		>
			{children}
		</IconButton>
	</div>
