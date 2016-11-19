import React			from 'react'
import { connect }		from 'react-redux'

import HyperHeader		from './HyperHeader'

class HeadAndFoot extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	render() {
		return (
			<div id="app">
				<div id="hyperHeader">
					<HyperHeader location={this.props.location}/>
				</div>
				<div id="hyperBody">
					{this.props.children}
				</div>
				<div id="hyperFooter">
					FOOTER
				</div>
			</div>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(HeadAndFoot)
