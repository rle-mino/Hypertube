import React					from 'react'
import { connect }				from 'react-redux'
import { bindActionCreators }	from 'redux'
import { selectAuth }			from '../../action/auth'
import lang						from '../../lang'
import colors					from '../../colors/colors'

import TextField				from 'material-ui/TextField'
import FlatButton				from 'material-ui/FlatButton'

const textFieldSet = {
	className: 'textInp',
	autoComplete: 'off',
	floatingLabelFocusStyle: { color: colors.lightBlue },
	underlineFocusStyle: { borderColor: colors.lightBlue }
}

class registerForm extends React.Component {
	_mounted = false

	state = {
		username: null,
		password: null,
		passwordConfirm: null,
		mail: null,
		usernameR: null,
		passwordR: null,
		passwordConfirmR: null,
		mailR: null,
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	signUp = () => {
		const { username, password, passwordConfirm, mail } = this.state
		this.setState({
			usernameR: null,
			passwordR: null,
			passwordConfirmR: null,
			mailR: null,
		})
		if (password !== passwordConfirm) {
			this.setState({
				passwordConfirmR: lang.passwordAreDifferent[this.props.l]
			})
		}
		const data = {
			username,
			password,
			mail
		}
		console.log(data)
		this.props.selectAuth(100)
	}

	render() {
		const { l } = this.props
		const { usernameR, passwordR, mailR, passwordConfirmR } = this.state
		return (
			<form className="authForm" onChange={this.handleChange}>
				<TextField
			    	floatingLabelText={lang.username[l]}
					name="username"
					type="text"
					errorText={usernameR}
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.mail[l]}
					name="mail"
					type="mail"
					errorText={mailR}
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.password[l]}
					name="password"
					type="password"
					errorText={passwordR}
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.passwordConfirm[l]}
					name="passwordConfirm"
					type="password"
					errorText={passwordConfirmR}
					{ ...textFieldSet }
    			/>
				<FlatButton
					label={lang.SIGNUP[l]}
					style={{ width: '80%', marginTop: '20px' }}
					onClick={this.signUp}
				/>
			</form>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l
	}
}

const matchDispatchToProps = (dispatch) => {
	return bindActionCreators({ selectAuth }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(registerForm)
