import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { browserHistory }		from 'react-router'
import axios					from 'axios'
import { selectLang }			from '../action/lang'
import colors					from '../colors/colors'
import lang						from '../lang'

import IconMenu					from 'material-ui/IconMenu'
import MenuItem					from 'material-ui/MenuItem'
import IconButton				from 'material-ui/IconButton'
import SearchForm				from '../components/SearchForm'
import ColPick					from '../components/ColPick'

import './sass/header.sass'

class HyperHeader extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
		axios({
			url: 'http://e3r2p7.42.fr:8080/test',
			method: 'post',
		}).then((response) => {
			console.log(response.data)
		})
	}

	componentWillUnmount() {
		this._mounted = false
	}

	goHome = () => browserHistory.push('/ht')

	render() {
		const { mainColor, l, selectLang } = this.props
		console.log(l);
		return (
			<div style={{ backgroundColor: mainColor }} className="headerContainer">
				<span className="hyperTitle" onClick={this.goHome}>HYPERTUBE</span>
				<SearchForm />
				<IconMenu
					style={{ marginRight: '10px' }}
					iconButtonElement={
						<IconButton iconStyle={{ color: 'white' }}>
							<i className="material-icons">more_vert</i>
						</IconButton>
					}
					anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
					targetOrigin={{ horizontal: 'right', vertical: 'top' }}
				>
					<MenuItem primaryText="theme"
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
						]}/>
					<MenuItem primaryText={lang.language[l]}
						menuItems={[
							<MenuItem
								primaryText="English"
								onClick={() => this.props.selectLang(0)}
							>
								{l === 0 &&
									<i
										className="material-icons"
										style={{ float: 'right', marginTop: '10px' }}
									>done</i>}
							</MenuItem>,
							<MenuItem primaryText="Français" onClick={() => selectLang(1)}>
								{l === 1 &&
									<i
										className="material-icons"
										style={{ float: 'right', marginTop: '10px', marginRight: '-5px' }}
									>done</i>}
							</MenuItem>,
						]}/>
				</IconMenu>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l,
		mainColor: state.theme.mainColor
	}
}
const matchDispatchToProps = (dispatch) => {
	return bindActionCreators({ selectLang }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(HyperHeader)
