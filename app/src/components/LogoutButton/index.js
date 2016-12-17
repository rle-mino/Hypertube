import React				from 'react'
import browserHistory		from 'react-router/lib/browserHistory'
import lang					from '../../lang'

import MenuItem				from 'material-ui/MenuItem'

export default class Logout extends React.Component {
	logout = () => {
		localStorage.removeItem('logToken')
		browserHistory.push('/')
	}

	render() {
		const { l } = this.props
		return (
			<MenuItem
				primaryText={lang.logout[l]}
				onTouchTap={this.logout}
				style={{ textAlign: 'center' }}
			/>
		)
	}
}
