import React					from 'react'
import { connect }				from 'react-redux'
import api						from '../../../apiCall'
import { selectAuth }			from '../../../action/auth'
import lang						from '../../../lang'
import colors					from '../../../colors/colors'

import TextField				from 'material-ui/TextField'
import FlatButton				from 'material-ui/FlatButton'
import ExtLogin					from './ExtLogin'

import '../sass/login.sass'

const textFieldSet = {
	className: 'textInp',
	autoComplete: 'off',
	floatingLabelFocusStyle: { color: colors.red },
	underlineFocusStyle: { borderColor: colors.red }
}

class LoginForm extends React.Component {
	_mounted = false

	state = {
		username: '',
		password: '',
		usernameR: '',
		passwordR: '',
	}

	componentDidMount() {
		this._mounted = true
		const { token } = this.props.location.query
		if (token) {
			localStorage.setItem('logToken', token)
			this.props.dispatch(selectAuth(100))
		}
	}

	componentWillUnmount() {
		this._mounted = false
	}

	signin = async () => {
		this.setState({
			usernameR: '',
			passwordR: '',
		})
		const cred = {
			username: this.state.username,
			password: this.state.password
		}
		const { data } = await api.login(cred)
		console.log(data)
		if (data.status === undefined) return false
		if (data.status.includes('error')) {
			if (data.details.includes('invalid request')) {
				const error = {}
				data.error.forEach((el) => {
					if (!error[`${el.path}R`]) {
						error[`${el.path}R`] = lang.errorP[el.type][this.props.l]
					}
				})
				this.setState({ ...error })
			} else if (data.details) {
				if (data.details.includes('user doenst exist')) {
					this.setState({ serverResponse: lang.userDoesntExist[this.props.l] })
				} else {
					this.setState({ serverResponse: lang.error[this.props.l] })
				}
			}
		} else {

			// this.props.dispatch(selectAuth(100))
		}
	}

	checkSub = (e) => {
		if (e.keyCode === 13) this.signin()
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	setForgot = () => {
		this.props.dispatch(selectAuth(2))
	}

	render() {
		const { l } = this.props
		const { usernameR, passwordR, serverResponse } = this.state
		return (
			<form className="authForm" onChange={this.handleChange} onKeyDown={this.checkSub}>
				<div className="serverResponse">{serverResponse}</div>
				<ExtLogin />
				<TextField
			    	floatingLabelText={lang.username[l]}
					name="username"
					type="text"
					errorText={usernameR}
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.password[l]}
					name="password"
					type="password"
					errorText={passwordR}
					{ ...textFieldSet }
    			/>
				<FlatButton
					label={lang.SIGNIN[l]}
					style={{ width: '80%', marginTop: '20px' }}
					onClick={this.signin}
				/>
				<FlatButton
					label={`${lang.forgotPassword[l]}?`}
					style={{ width: '80%', marginTop: '10px' }}
					onClick={this.setForgot}
				/>
			</form>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(LoginForm)
