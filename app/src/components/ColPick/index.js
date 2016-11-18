import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { selectMainColor }		from '../../action/theme'

import selectedSVG				from '../../svg/ic_done_white_24px.svg'
import MenuItem					from 'material-ui/MenuItem'

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
			<MenuItem
				innerDivStyle={{
					width: '30px',
					height: '30px'
				}}
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'row',
				}}
				onTouchTap={() => this.props.selectMainColor(this.props.color)}
			>
				<div className="colSelect" style={{
					backgroundColor: this.props.color,
					marginTop: '10px',
					backgroundImage: this.props.color === this.props.mainColor ? `url(${selectedSVG})` : 'none',
				}}/>
			</MenuItem>
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
