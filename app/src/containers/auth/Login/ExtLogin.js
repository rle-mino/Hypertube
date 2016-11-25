import React				from 'react'
import { connect }			from 'react-redux'
import lang					from '../../../lang'

import IconButton			from 'material-ui/IconButton'

const iconSet = {
	touch: false,
	className: 'extButton',
	tooltipPosition: 'top-center',
}

class ExtLogin extends React.Component {
	_mounted = false

	state = {
		popout: false,
		selectedStrat: null,
		selectedURL: null,
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	ftLogin = (e) => {
		window.location.replace(
			'http://localhost:8080/api/user/auth/42?next=http://localhost:3000'
		)
	}
	facebookLogin = (e) => {
		window.location.replace(
			'http://localhost:8080/api/user/auth/facebook?next=http://localhost:3000'
		)
	}

	popoutClosed = (e) => {
		this.setState({ popout: false })
	}

	render() {
		const { l } = this.props
		return (
			<div className="extLogin">
				<IconButton
					tooltip={`${lang.signInWith[l]} google`}
					iconClassName="fa fa-google"
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} facebook`}
					iconClassName="fa fa-facebook-official"
					onTouchTap={this.facebookLogin}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} twitter`}
					iconClassName="fa fa-twitter"
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} github`}
					iconClassName="fa fa-github"
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} 42`}
					iconClassName="icon"
					onTouchTap={this.ftLogin}
					{...iconSet}
				/>
			</div>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(ExtLogin)
