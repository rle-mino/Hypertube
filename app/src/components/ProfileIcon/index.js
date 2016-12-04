import React					from 'react'
import { browserHistory }		from 'react-router'
import lang						from '../../lang'
import * as bodyDis				from '../../action/body'

import IconButton				from 'material-ui/IconButton'
import Avatar					from 'material-ui/Avatar'
import CircularProgress			from 'material-ui/CircularProgress'

export default ({ image, l, dispatch }) => {
	const goProfilePage = () => {
		dispatch(bodyDis.bOut())
		setTimeout(() => {
			browserHistory.push('/ht/profile')
			dispatch(bodyDis.bIn())
		}, 500)
	}

	return (
		<div className="profileIcon">
			{(image &&
				<IconButton tooltip={lang.profile[l]}
					style={{ padding: 0, zIndex: '10' }}
					touch={true}
					onTouchTap={goProfilePage}
				>
					<Avatar src={image} />
				</IconButton>) ||
				<CircularProgress color="white"/>
			}
		</div>
	)
}
