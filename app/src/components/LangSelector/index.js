import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { selectLang }			from '../../action/lang'
import lang						from '../../lang'

import Menu						from 'material-ui/Menu'
import RaisedButton				from 'material-ui/RaisedButton'
import MenuItem					from 'material-ui/MenuItem'
import { Popover }				from 'material-ui/Popover'

import './langSelector.sass'

class LangSelector extends React.Component {
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
		this.props.selectLang(newValue)
		this.setState({ open: false })
	}

	render() {
		return (
			<div className={this.props.class}>
				<RaisedButton
					onTouchTap={this.handleTouchTap}
    				label={lang.language[this.props.l]}
	  			/>
				<Popover
			        open={this.state.open}
			        anchorEl={this.state.anchorEl}
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

const mapStateToProps = ({ lang }) => ({ l: lang.l })

const matchDispatchToProps = (dispatch) => bindActionCreators({ selectLang }, dispatch)

export default connect(mapStateToProps, matchDispatchToProps)(LangSelector)
