import React			from 'react'

import IconButton		from 'material-ui/IconButton'

export default ({ volume, mainColor, onClick, onMouseDown }) =>
	<div className="volumeContainer">
		<IconButton>
			<i className="material-icons">volume_up</i>
		</IconButton>
	</div>
