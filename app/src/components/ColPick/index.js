import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { selectMainColor }		from '../../action/theme'

import selectedSVG				from '../../svg/ic_done_white_24px.svg'

import './colPick.sass'

class ColPick extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	render() {
		return (
			<div
				className="colSelect"
				style={{
					backgroundColor: this.props.color,
					backgroundImage: this.props.color === this.props.mainColor ? `url(${selectedSVG})` : 'none'
				}}
				onClick={() => this.props.selectMainColor(this.props.color)}
			/>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l,
		mainColor: state.theme.mainColor,
	}
}

const matchDispatchToProps = (dispatch) => {
	return bindActionCreators({ selectMainColor }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(ColPick)
