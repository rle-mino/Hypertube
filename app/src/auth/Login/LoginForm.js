import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { browserHistory }		from 'react-router'
import { selectAuth }			from '../../action/auth'
import lang						from '../../lang'
import textFieldSet				from '../textFieldSet'

import TextField				from 'material-ui/TextField'
import FlatButton				from 'material-ui/FlatButton'
import ExtLogin					from './ExtLogin'

import '../sass/login.sass'

class LoginForm extends React.Component {
	_mounted = false

	state = {
		username: '',
		password: '',
		usernameError: '',
		passwordError: '',
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	signin = (e) => {
		const data = {
			username: this.state.username,
			password: this.state.password
		}
		console.log(data)
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	setForgot = () => {
		this.props.selectAuth(2)
		setTimeout(() => {
			if (this._mounted) browserHistory.push('/forgot')
		}, 300)
	}

	render() {
		const { l } = this.props
		const { usernameError, passwordError } = this.state
		return (
			<form className="authForm" onChange={this.handleChange}>
				<ExtLogin />
				<TextField
			    	floatingLabelText={lang.username[l]}
					name="username"
					type="text"
					errorText={usernameError}
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.password[l]}
					name="password"
					type="password"
					errorText={passwordError}
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
