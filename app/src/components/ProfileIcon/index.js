import React					from 'react'
import { connect }				from 'react-redux'
import { browserHistory }		from 'react-router'
import lang						from '../../lang'
import IconButton				from 'material-ui/IconButton'
import Avatar					from 'material-ui/Avatar'
import CircularProgress			from 'material-ui/CircularProgress'

const ProfileIcon = ({ image, l }) =>
	<div className="profileIcon">
		{(image &&
			<IconButton tooltip={lang.profile[l]}
				style={{ padding: 0 }}
				touch={true}
				onTouchTap={() => browserHistory.push('/ht/profile')}
			>
				<Avatar src={image} />
			</IconButton>) ||
			<CircularProgress />
		}
	</div>

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(ProfileIcon)
