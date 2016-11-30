import React			from 'react'
import { connect }		from 'react-redux'

import HyperHeader		from './HyperHeader'

const HeadAndBody = ({ location, children, bodyClass, mainColor }) =>
	<div id="app">
		<div id="hyperHeader">
			<HyperHeader location={location}/>
		</div>
		<div id="hyperBody" className={bodyClass}>
			{children}
		</div>
		<div id="hyperFooter" style={{ backgroundColor: mainColor }}>
			@2016 MJARRAYA - OPICHOU - ATRANG - RLE-MINO
		</div>
	</div>

const mapStateToProps = ({ body, theme }) => ({
	bodyClass: body,
	mainColor: theme.mainColor
})

export default connect(mapStateToProps)(HeadAndBody)
