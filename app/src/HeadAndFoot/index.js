import React			from 'react'
import { connect }		from 'react-redux'
import lang				from '../lang'

class HeadAndFoot extends React.Component {
	render() {
		return (
			<div>

			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l
	}
}

export default connect(mapStateToProps)(HeadAndFoot)
