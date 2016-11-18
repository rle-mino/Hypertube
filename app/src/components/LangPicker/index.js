import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { selectLang }			from '../../action/lang'
import lang						from '../../lang'

import MenuItem					from 'material-ui/MenuItem'

class LangPicker extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	render() {
		const { l, selectLang } = this.props
		return (
			<div>
				<MenuItem primaryText={lang.language[l]}
					leftIcon={<i className="material-icons">chevron_left</i>}
					menuItems={[
						<MenuItem
							primaryText="English"
							onClick={() => selectLang(0)}
							checked={l === 0}
						/>,
						<MenuItem
							primaryText="Français"
							onClick={() => selectLang(1)}
							checked={l === 1}
						/>
					]}
				/>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l
	}
}

const matchDispatchToProps = (dispatch) => {
	return bindActionCreators({ selectLang }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(LangPicker)
