import React				from 'react'
import { browserHistory }	from 'react-router'
import lang					from '../../lang'

import MenuItem				from 'material-ui/MenuItem'

export default ({ l }) => {
	const logout = () => {
		localStorage.removeItem('logToken')
		browserHistory.push('/')
	}

	return (
			<MenuItem
				primaryText={lang.logout[l]}
				onTouchTap={logout}
				style={{ textAlign: 'center' }}
			/>
	)
}
