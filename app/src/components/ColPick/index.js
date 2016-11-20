import React					from 'react'
import { selectMainColor }		from '../../action/theme'

import selectedSVG				from '../../svg/ic_done_white_24px.svg'
import MenuItem					from 'material-ui/MenuItem'

import './colPick.sass'

export default class ColPick extends React.Component {
	render() {
		const { color, mainColor, dispatch } = this.props
		return (
			<MenuItem
				innerDivStyle={{
					width: '30px',
					height: '30px'
				}}
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'row',
				}}
				onTouchTap={() => dispatch(selectMainColor(color))}
			>
				<div className="colSelect" style={{
					backgroundColor: color,
					marginTop: '10px',
					backgroundImage: color === mainColor ? `url(${selectedSVG})` : 'none',
				}} />
			</MenuItem>
		)
	}
}
