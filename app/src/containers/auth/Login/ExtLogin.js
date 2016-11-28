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

	githubLogin = (e) => {
		window.location.replace(
			'http://localhost:8080/api/user/auth/github?next=http://localhost:3000'
		)
	}

	twitterLogin = (e) => {
		window.location.replace(
			'http://localhost:8080/api/user/auth/twitter?next=http://localhost:3000'
		)
	}

	googleLogin = (e) => {
		window.location.replace(
			'http://localhost:8080/api/user/auth/google?next=http://localhost:3000'
		)
	}

	render() {
		const { l } = this.props
		return (
			<div className="extLogin">
				<IconButton
					tooltip={`${lang.signInWith[l]} google`}
					iconClassName="fa fa-google"
					onTouchTap={this.googleLogin}
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
					onTouchTap={this.twitterLogin}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} github`}
					iconClassName="fa fa-github"
					onTouchTap={this.githubLogin}
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
