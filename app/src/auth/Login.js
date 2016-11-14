import React				from 'react'
import { connect }			from 'react-redux'

import FloatingActionButton	from 'material-ui/FloatingActionButton'
import TextField			from 'material-ui/TextField'
import FlatButton			from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'

import './sass/login.sass'

const textFieldSet = {
	className: 'textInp',
	autoComplete: 'off',
	floatingLabelFocusStyle: { color: '#f44336' },
	underlineFocusStyle: { borderColor: '#f44336' }
}

class ExtLogin extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	render() {
		return (
			<div className="extLogin">
				<IconButton
					tooltip="sign in with google" touch={true}
					iconClassName="fa fa-google"
					className="extButton"
				/>
				<IconButton
					tooltip="sign in with facebook" touch={true}
					iconClassName="fa fa-facebook-official"
					className="extButton"
				/>
				<IconButton
					tooltip="sign in with twitter" touch={true}
					iconClassName="fa fa-twitter"
					className="extButton"
				/>
				<IconButton
					tooltip="sign in with github" touch={true}
					iconClassName="fa fa-github"
					className="extButton"
				/>
				<IconButton
					tooltip="sign in with 42" touch={true}
					iconClassName="icon"
					className="extButton 42logo"
				/>
			</div>
		)
	}
}

class LoginForm extends React.Component {
	_mounted = false

	state = {
		username: '',
		password: '',
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

	render() {
		return (
			<form className={`loginForm ${this.props.mainClass}`} onChange={this.handleChange}>
				<ExtLogin />
				<TextField
			    	floatingLabelText="username"
					name="username"
					type="text"
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText="password"
					name="password"
					type="password"
					{ ...textFieldSet }
    			/>
				<FlatButton
					label="sign in"
					style={{ width: '80%', marginTop: '10px' }}
					onClick={this.signin}
				/>
			</form>
		)
	}
}

class Login extends React.Component {
	_mounted = false

	state = {
		floatColor: '#607d8b',
		loginFormClass: 'in',
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	setRegister = (e) => {

	}

	render() {
		const floatStyle = { backgroundColor: this.state.floatColor }
		const { loginFormClass } = this.state;
		return (
			<div className="authComp login">
				<div className="topColored">
					<h1 className="mainTitle">Sign in</h1>
					<div className="registerButton">
						<FloatingActionButton {...floatStyle} onClick={this.setRegister}>
							<i
								className="material-icons account"
								style={{ color: 'white' }}
							>
								account_circle
							</i>
						</FloatingActionButton>
					</div>
				</div>
				<div className="botColored">
					<LoginForm mainClass={loginFormClass}/>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		mainColor: state.theme.mainColor,
	}
}

export default connect(mapStateToProps)(Login)
