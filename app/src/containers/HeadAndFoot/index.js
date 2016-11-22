import React			from 'react'
import { connect }		from 'react-redux'

import HyperHeader		from './HyperHeader'

const HeadAndBody = ({ location, children, bodyClass }) =>
	<div id="app">
		<div id="hyperHeader">
			<HyperHeader location={location}/>
		</div>
		<div id="hyperBody" className={bodyClass}>
			{children}
		</div>
		<div id="hyperFooter">
			FOOTER
		</div>
	</div>

const mapStateToProps = ({ body }) => ({
	bodyClass: body
})

export default connect(mapStateToProps)(HeadAndBody)
