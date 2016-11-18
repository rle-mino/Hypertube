import React					from 'react'
import colors					from '../../colors/colors'

import MenuItem					from 'material-ui/MenuItem'
import ColPick					from '../ColPick'

export default class ColorPicker extends React.Component {
	render(){
		return (
			<MenuItem
				primaryText="theme"
				leftIcon={<i className="material-icons">chevron_left</i>}
				menuItems={[
					<ColPick color={colors.red} />,
					<ColPick color={colors.pink} />,
					<ColPick color={colors.purple} />,
					<ColPick color={colors.deepPurple} />,
					<ColPick color={colors.indigo} />,
					<ColPick color={colors.blue} />,
					<ColPick color={colors.lightBlue} />,
					<ColPick color={colors.cyan} />,
					<ColPick color={colors.teal} />,
					<ColPick color={colors.green} />,
					<ColPick color={colors.lightGreen} />,
					<ColPick color={colors.lime} />,
					<ColPick color={colors.yellow} />,
					<ColPick color={colors.amber} />,
					<ColPick color={colors.orange} />,
					<ColPick color={colors.deepOrange} />,
					<ColPick color={colors.brown} />,
					<ColPick color={colors.grey} />,
					<ColPick color={colors.blueGrey} />,
				]}
			/>
		)
	}
}
