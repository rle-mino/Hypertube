import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
// import axios					from 'axios'
import { selectAuth }			from '../../action/auth'
import lang						from '../../lang'
import colors					from '../../colors/colors'

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
	}

	componentWillUnmount() {
		this._mounted = false
	}

	signin = () => {
		const data = {
			username: this.state.username,
			password: this.state.password
		}
		console.log(data)
		// axios({
		// 	url: 'http://e3r2p7.42.fr:8080/login',
		// 	method: 'post',
		// 	data,
		// }).then((response) => {
		// 	console.log(response)
		// 	if (response.data.status === true) {
		// 	}
		// })
		this.props.selectAuth(100)
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
		this.props.selectAuth(2)
	}

	render() {
		const { l } = this.props
		const { usernameR, passwordR } = this.state
		return (
			<form className="authForm" onChange={this.handleChange} onKeyDown={this.checkSub}>
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

const mapStateToProps = (state) => {
	return {
		l: state.lang.l,
	}
}

const matchDispatchToProps = (dispatch) => {
	return bindActionCreators({ selectAuth }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(LoginForm)
