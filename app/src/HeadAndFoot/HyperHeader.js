import React					from 'react'
import { connect }				from 'react-redux'
import { browserHistory }		from 'react-router'
// import axios					from 'axios'
// import lang						from '../lang'

import IconMenu					from 'material-ui/IconMenu'
import IconButton				from 'material-ui/IconButton'
import SearchForm				from '../components/SearchForm'
import LangPicker				from '../components/LangPicker'
import ColorPicker				from '../components/ColorPicker'

import './sass/header.sass'

class HyperHeader extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
		// axios({
		// 	url: 'http://e3r2p7.42.fr:8080/test',
		// 	method: 'post',
		// }).then((response) => {
		// 	console.log(response.data)
		// })
	}

	componentWillUnmount() {
		this._mounted = false
	}

	goHome = () => browserHistory.push('/ht')

	render() {
		const { mainColor } = this.props
		return (
			<div style={{ backgroundColor: mainColor }} className="headerContainer">
				<span className="hyperTitle" onClick={this.goHome}>HYPERTUBE</span>
				<SearchForm />
				<IconMenu
					style={{ marginRight: '10px' }}
					iconButtonElement={
						<IconButton iconStyle={{ color: 'white' }}>
							<i className="material-icons">more_vert</i>
						</IconButton>
					}
					anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
					targetOrigin={{ horizontal: 'right', vertical: 'top' }}
				>
					<ColorPicker />
					<LangPicker />
				</IconMenu>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l,
		mainColor: state.theme.mainColor
	}
}

export default connect(mapStateToProps)(HyperHeader)
