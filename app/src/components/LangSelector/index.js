import React					from 'react'
import { selectLang }			from '../../action/lang'
import lang						from '../../lang'

import Menu						from 'material-ui/Menu'
import RaisedButton				from 'material-ui/RaisedButton'
import MenuItem					from 'material-ui/MenuItem'
import { Popover }				from 'material-ui/Popover'

import './langSelector.sass'

export default class LangSelector extends React.Component {
	state = {
		open: false
	}

	handleTouchTap = (e) => {
		e.preventDefault()
		this.setState({ open: true, anchorEl: e.currentTarget })
	}

	handleRequestClose = () => {
		this.setState({ open: false })
	}

	setLang = (newValue) => {
		const { dispatch } = this.props
		dispatch(selectLang(newValue))
		this.setState({ open: false })
	}

	render() {
		const { className, l } = this.props
		const { open, anchorEl } = this.state
		return (
			<div className={className}>
				<RaisedButton
					onTouchTap={this.handleTouchTap}
    				label={lang.language[l]}
	  			/>
				<Popover
			        open={open}
			        anchorEl={anchorEl}
			        anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
			        targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
			        onRequestClose={this.handleRequestClose}
		        >
			        <Menu style={{ textAlign: 'center', width: 'auto' }}>
						<MenuItem
							primaryText="ENGLISH"
							style={{ fontSize: '12px' }}
							onClick={() => this.setLang(0)}
						/>
			            <MenuItem
							primaryText="FRANÇAIS"
							style={{ fontSize: '12px' }}
							onClick={() => this.setLang(1)}
						/>
			    	</Menu>
		        </Popover>
			</div>
		)
	}
}
