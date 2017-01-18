import React				from 'react'
import { connect }			from 'react-redux'
import lang					from '../../../lang'
import apiConnect from '../../../apiConnect';

import IconButton			from 'material-ui/IconButton'

const apiAuth = `${apiConnect}/api/user/auth`

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

	oauth = (url) => window.location.replace(`${url}?next=http://localhost:8080`)

	render() {
		const { l } = this.props
		return (
			<div className="extLogin">
				<IconButton
					tooltip={`${lang.signInWith[l]} google`}
					iconClassName="fa fa-google"
					onTouchTap={() => this.oauth(`${apiAuth}/google`)}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} facebook`}
					iconClassName="fa fa-facebook-official"
					onTouchTap={() => this.oauth(`${apiAuth}/facebook`)}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} twitter`}
					iconClassName="fa fa-twitter"
					onTouchTap={() => this.oauth(`${apiAuth}/twitter`)}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} linkedin`}
					iconClassName="fa fa-linkedin"
					onTouchTap={() => this.oauth(`${apiAuth}/linkedin`)}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} spotify`}
					iconClassName="fa fa-spotify"
					onTouchTap={() => this.oauth(`${apiAuth}/spotify`)}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} github`}
					iconClassName="fa fa-github"
					onTouchTap={() => this.oauth(`${apiAuth}/github`)}
					{...iconSet}
				/>
				<IconButton
					tooltip={`${lang.signInWith[l]} 42`}
					iconClassName="icon"
					onTouchTap={() => this.oauth(`${apiAuth}/42`)}
					{...iconSet}
				/>
			</div>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(ExtLogin)
