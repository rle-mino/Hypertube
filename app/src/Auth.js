import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { browserHistory }		from 'react-router'
import lang						from './lang'
import { selectAuth }			from './action/auth'

import FloatingActionButton		from 'material-ui/FloatingActionButton'

import './auth.sass'

const loginIcon =
	<i className="fa fa-sign-in" style={{ color: 'white', fontSize: '20px' }} />

const registerIcon =
	<i className="material-icons account" style={{ color: 'white' }}>
		person_add
	</i>

class Auth extends React.Component {
	_mounted = false

	state = {
		logRegButton: 'floatButton',
		floatIcon: loginIcon,
		floatColor: '#03a9f4',
		mainTitle: lang.signIn[this.props.l],
		titleClass: 'mainTitle',
		rippled: '',
		topCol: '#f44336',
		update: false,
		nextColor: 'white',
		formContainer: 'formContainer log',
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	componentWillMount() {
		const { pathname } = this.props.location

		if (pathname === '/register') {
			this.setState({
				floatIcon: registerIcon,
				formContainer: 'formContainer reg',
				mainTitle: lang.signUp[this.props.l],
				floatColor: '#f44336',
				topCol: '#03a9f4'
			})
			this.props.selectAuth(1)

		} else if (pathname === '/forgot') {
			this.setState({
				floatIcon: loginIcon,
				mainTitle: lang.forgotPassword[this.props.l],
				topCol: '#673ab7'
			})
			this.props.selectAuth(2)
		}
	}

	componentWillReceiveProps = (newProps) => {
		if (newProps.selectedAuth === 2 && newProps.selectedAuth !== this.props.selectedAuth) {

			const nextColor = '#673ab7'
			const formContainerRes = 'formContainer forg'
			const formContainer = `${formContainerRes} leave`
			const resetOBJ = {
				update: false,
				rippled: '',
				titleClass: 'mainTitle',
				logRegButton: 'floatButton',
				formContainer: formContainerRes,
			}
			this.setState({
				update: true,
				rippled: 'rippleTopAuth',
				titleClass: 'mainTitle out',
				logRegButton: 'floatButton out',
				formContainer,
				nextColor,
			})

			setTimeout(async() => {
				await this.setState({
					floatIcon: loginIcon,
					mainTitle: lang.forgotPassword[this.props.l],
					floatColor: '#f44336',
					topCol: '#673ab7',
					...resetOBJ,
				})
			}, 350)

		}
	}

	updateAuth = async () => {
		if (this.state.update) return false

		const { selectedAuth } = this.props
		const nextColor = selectedAuth === 0 ? '#03a9f4' : '#f44336'

		let formContainerRes = 'formContainer';
		if (selectedAuth === 0) formContainerRes += ' reg'
		else formContainerRes += ' log'

		const formContainer = `${formContainerRes} leave`
		const resetOBJ = {
			update: false,
			rippled: '',
			titleClass: 'mainTitle',
			logRegButton: 'floatButton',
			formContainer: formContainerRes,
		}
		this.setState({
			update: true,
			rippled: 'rippleTopAuth',
			titleClass: 'mainTitle out',
			logRegButton: 'floatButton out',
			formContainer,
			nextColor,
		})
		setTimeout(() => {

			if (selectedAuth === 0) {
				// FROM LOGIN TO REGISTER
				this.setState({
					floatIcon: loginIcon,
					mainTitle: lang.signUp[this.props.l],
					floatColor: '#f44336',
					topCol: '#03a9f4',
					...resetOBJ,
				})
				browserHistory.push('/register')

			} else {
				// FROM OTHER TO LOGIN
				this.setState({
					floatIcon: registerIcon,
					mainTitle: lang.signIn[this.props.l],
					floatColor: '#03a9f4',
					topCol: '#f44336',
					...resetOBJ,
				})
				browserHistory.push('/')
			}

			this.props.selectAuth(selectedAuth === 0 ? 1 : 0)
		}, 300)
	}

	render() {
		const floatStyle = { backgroundColor: this.state.floatColor }
		const {
			logRegButton,
			floatIcon,
			mainTitle,
			titleClass,
			rippled,
			topCol,
			nextColor,
			formContainer
		} = this.state
		return (
			<div className="authComp">
				<div className="topColored" style={{ backgroundColor: topCol }}>
					<div className={rippled} style={{ backgroundColor: nextColor }}/>
					<h1 className={titleClass}>{mainTitle}</h1>
				</div>
				<div className={logRegButton}>
					<FloatingActionButton {...floatStyle} onClick={this.updateAuth}>
						{floatIcon}
					</FloatingActionButton>
				</div>
				<div className="botColored">
					<div className={formContainer}>
					{this.props.children}
					</div>
				</div>
			</div>
		)
	}
}

const matchDispatchToProps = (dispatch) => {
	return bindActionCreators({ selectAuth }, dispatch)
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l,
		selectedAuth: state.auth
	}
}

export default connect(mapStateToProps, matchDispatchToProps)(Auth)
