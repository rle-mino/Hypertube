import React					from 'react'
import { connect }				from 'react-redux'
import { browserHistory }		from 'react-router'
import api						from '../../apiCall'
import * as bodyDis				from '../../action/body'

import IconMenu					from 'material-ui/IconMenu'
import IconButton				from 'material-ui/IconButton'
import SearchForm				from '../../components/SearchForm'
import LangPicker				from '../../components/LangPicker'
import ColorPicker				from '../../components/ColorPicker'
import ProfileIcon				from '../../components/ProfileIcon'
import LogoutButton				from '../../components/LogoutButton'
import noImage					from '../../../public/No-image-found.jpg'

import './sass/header.sass'

class HyperHeader extends React.Component {
	_mounted = false

	state = {
		image: null,
	}

	componentDidMount = async () => {
		this._mounted = true
		const { data } = await api.getPict()
		if (!this._mounted) return false
		if (data.status.includes('success')) {
			this.setState({ image: data.image })
		} else {
			if (data.details.includes('user not authorized') ||
				data.details.includes('invalid token')
			) {
				browserHistory.push('/')
			} else {
				this.setState({ image: noImage })
			}
		}
	}

	componentWillUnmount() {
		this._mounted = false
	}

	goHome = () => {
		const { dispatch } = this.props
		dispatch(bodyDis.bOut())
		setTimeout(() => browserHistory.push('/ht'), 500)
	}

	render() {
		const { mainColor, location, l, dispatch } = this.props
		const { image } = this.state
		return (
			<div style={{ backgroundColor: mainColor }} className="headerContainer">
				<span className="hyperTitle" onClick={this.goHome}>HYPERTUBE</span>
				<SearchForm location={location} l={l} dispatch={dispatch}/>
				<div className="profSet">
					<ProfileIcon image={image ? image : null} l={l} dispatch={dispatch}/>
					<IconMenu
						style={{ marginRight: '10px' }}
						anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
						targetOrigin={{ horizontal: 'right', vertical: 'top' }}
						iconButtonElement={
							<IconButton
								iconStyle={{ color: 'white' }}
								style={{ padding: 0, zIndex: '10' }}
							>
								<i className="material-icons">more_vert</i>
							</IconButton>
						}
					>
						<ColorPicker mainColor={mainColor} dispatch={dispatch} />
						<LangPicker l={l} dispatch={dispatch} />
						<LogoutButton l={l} />
					</IconMenu>
				</div>
			</div>
		)
	}
}

const mapStateToProps = ({ lang, theme }) => ({
	l: lang.l,
	mainColor: theme.mainColor,
})

export default connect(mapStateToProps)(HyperHeader)
