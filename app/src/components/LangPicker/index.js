import React					from 'react'
import { selectLang }			from '../../action/lang'
import lang						from '../../lang'

import MenuItem					from 'material-ui/MenuItem'

export default class LangPicker extends React.Component {
	render() {
		const { l, dispatch } = this.props
		return (
			<MenuItem primaryText={lang.language[l]}
				leftIcon={<i className="material-icons">chevron_left</i>}
				menuItems={[
					<MenuItem
						primaryText="English"
						onClick={() => dispatch(selectLang(0))}
						checked={l === 0}
					/>,
					<MenuItem
						primaryText="Français"
						onClick={() => dispatch(selectLang(1))}
						checked={l === 1}
					/>
				]}
			/>
		)
	}
}
