import React				from 'react'
import { connect }			from 'react-redux'
import lang					from '../../lang'

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
					{...iconSet}
				/>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l,
	}
}

export default connect(mapStateToProps)(ExtLogin)
