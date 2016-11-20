import React			from 'react'

import HyperHeader		from './HyperHeader'

export default ({ location, children }) =>
	<div id="app">
		<div id="hyperHeader">
			<HyperHeader location={location}/>
		</div>
		<div id="hyperBody">
			{children}
		</div>
		<div id="hyperFooter">
			FOOTER
		</div>
	</div>
