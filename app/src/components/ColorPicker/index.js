import React					from 'react'
import _						from 'lodash'
import colors					from '../../colors/colors'

import MenuItem					from 'material-ui/MenuItem'
import ColPick					from '../ColPick'

export default class ColorPicker extends React.Component {
	createMenuItems = () => _.map(colors, (color) =>
		<ColPick
			color={color}
			mainColor={this.props.mainColor}
			dispatch={this.props.dispatch}
		/>
	)

	render(){
		return (
			<MenuItem
				primaryText="theme"
				leftIcon={<i className="material-icons">chevron_left</i>}
				menuItems={this.createMenuItems()}
			/>
		)
	}
}
