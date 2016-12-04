import React					from 'react'
import { connect }				from 'react-redux'
import { browserHistory }		from 'react-router'
import lang						from '../../lang'
import colors					from '../../colors/colors'
import { selectAuth }			from '../../action/auth'

import FloatingActionButton		from 'material-ui/FloatingActionButton'
import LangSelector				from '../../components/LangSelector'

import './sass/auth.sass'

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
		floatIcon: registerIcon,
		floatColor: colors.lightBlue,
		mainTitle: lang.signIn[this.props.l],
		titleClass: 'mainTitle',
		rippled: '',
		topCol: colors.red,
		update: false,
		nextColor: 'white',
		formContainer: 'formContainer',
		container: 'log',
	}

	componentDidMount = () => {
		this._mounted = true
		const { token } = this.props.location.query
		if (token) {
			localStorage.setItem('logToken', token)
			browserHistory.push('/ht')
			// this.props.dispatch(selectAuth(100))
		}
	}

	componentWillUnmount() {
		this._mounted = false
	}

	setupAuth = (props) => {
		const { pathname } = props.location
		const { dispatch } = props

		if (pathname === '/') {
			this.setState({
				floatIcon: registerIcon,
				formContainer: 'formContainer',
				mainTitle: lang.signIn[this.props.l],
				floatColor: colors.blue,
				topCol: colors.red,
				container: 'log'
			})
		}
		else if (pathname === '/register') {
			this.setState({
				floatIcon: loginIcon,
				formContainer: 'formContainer',
				mainTitle: lang.signUp[this.props.l],
				floatColor: colors.red,
				topCol: colors.blue,
				container: 'reg'
			})
			dispatch(selectAuth(1))

		} else if (pathname === '/forgot') {
			this.setState({
				floatIcon: loginIcon,
				formContainer: 'formContainer',
				mainTitle: lang.forgotPassword[this.props.l],
				floatColor: colors.red,
				topCol: colors.deepPurple,
				container: 'for'
			})
			dispatch(selectAuth(2))
		} else if (pathname === '/reset_password') {
			this.setState({
				floatIcon: loginIcon,
				mainTitle: lang.reset[this.props.l],
				formContainer: 'formContainer',
				floatColor: colors.red,
				topCol: colors.orange,
				container: 'res'
			})
			dispatch(selectAuth(3))
		}
	}

	componentWillMount() {
		this.setupAuth(this.props)
	}

	updateComp = (nextColor, nextFormClass,
						floatIcon, mainTitle,
						floatColor, cb) => {
		const formContainerRes = `formContainer ${nextFormClass}`
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
			nextColor,
			formContainer,
		})

		setTimeout(async() => {
			if (!this._mounted) return false
			cb()
			this.setState({
				floatIcon,
				mainTitle,
				floatColor,
				nextColor,
				topCol: nextColor,
				...resetOBJ,
			})
		}, 300)
	}

	// end = () => {
	// 	this.setState({ container: 'toCircle' })
	// 	setTimeout(() => {
	// 		this.setState({ container: 'toCircle toLeave' })
	// 		setTimeout(() => browserHistory.push('/ht'), 1000)
	// 	}, 1000)
	// }

	updateTitle = (l) => {
		switch (this.props.selectedAuth) {
			case 0:
				this.setState({ mainTitle: lang.signIn[l] })
				break
			case 1:
				this.setState({ mainTitle: lang.signUp[l] })
				break
			case 2:
				this.setState({ mainTitle: lang.forgotPassword[l] })
				break
			case 3:
				this.setState({ mainTitle: lang.reset[l] })
				break
			default:
				this.setState({ mainTitle: lang.signIn[l] })
				break
		}
	}

	componentWillReceiveProps = (newProps) => {
		if (newProps.l !== this.props.l) {
			this.updateTitle(newProps.l)
		}
		// if (newProps.selectedAuth === 100 &&
		// 	newProps.selectedAuth !== this.props.selectedAuth) {
		// 		this.end()
		// }
		const selectedChanged = newProps.selectedAuth !== this.props.selectedAuth
		const { l } = newProps
		if (newProps.selectedAuth === 0 && selectedChanged) {
			this.updateComp(colors.red, 'log', registerIcon,
							lang.signIn[l], colors.lightBlue,
							() => browserHistory.push('/'))
		}
		if (newProps.selectedAuth === 2 && selectedChanged) {
				// FROM LOGIN TO FORGOT
				this.updateComp(colors.deepPurple, 'forg', loginIcon,
								lang.forgotPassword[l],
								colors.red,
								() => browserHistory.push('/forgot'))
		} else if (newProps.selectedAuth === 3 && selectedChanged) {
				// FROM FORGOT TO RESET
				this.updateComp(colors.orange, 'res', loginIcon,
								lang.reset[l], colors.red,
							() => browserHistory.push('/reset_password'))
		} else if (newProps.location.pathname !== this.props.location.pathname) {
			this.setupAuth(newProps)
		}
	}

	updateAuth = async () => {
		if (this.state.update) return false
		const { dispatch } = this.props

		const selectedAuth = this.props.selectedAuth === 0 ? 1 : 0
		const nextColor = selectedAuth === 0 ? colors.red : colors.lightBlue
		const nextFormClass = selectedAuth === 0 ? 'log' : 'reg'
		const floatIcon = selectedAuth === 0 ? registerIcon : loginIcon
		const mainTitle = selectedAuth === 0 ? lang.signIn[this.props.l] : lang.signUp[this.props.l]
		const floatColor = selectedAuth === 0 ? colors.lightBlue : colors.red
		this.updateComp(nextColor, nextFormClass,
						floatIcon, mainTitle, floatColor,
						() => {
			dispatch(selectAuth(selectedAuth))
			browserHistory.push(selectedAuth === 0 ? '/' : '/register')
		})
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
			formContainer,
			container,
		} = this.state
		const { l, children, dispatch } = this.props
		return (
			<div id="auth">
				<div className={`authComp ${container}`}>
					<div className="topColored" style={{ backgroundColor: topCol }}>
						<div className={rippled} style={{ backgroundColor: nextColor }}/>
						<h1 className={titleClass}>{mainTitle}</h1>
						<LangSelector className="langSelectorAuth" l={l} dispatch={dispatch}/>
					</div>
					<div className={logRegButton}>
						<FloatingActionButton {...floatStyle} onClick={this.updateAuth}>
							{floatIcon}
						</FloatingActionButton>
					</div>
					<div className="botColored">
						<div className={formContainer}>
							{children}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = ({ auth, lang }) => ({
	l: lang.l,
	selectedAuth: auth,
})

export default connect(mapStateToProps)(Auth)
