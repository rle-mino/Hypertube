import React					from 'react'
import { bindActionCreators }	from 'redux'
import { connect }				from 'react-redux'
import { selectAuth }			from '../../action/auth'
import lang						from '../../lang'
import colors					from '../../colors/colors'

import TextField				from 'material-ui/TextField'
import FlatButton				from 'material-ui/FlatButton'

const textFieldSet = {
	className: 'textInp',
	autoComplete: 'off',
	floatingLabelFocusStyle: { color: colors.orange },
	underlineFocusStyle: { borderColor: colors.orange }
}

class ResetPassForm extends React.Component {
	_mounted = false

	state = {
		username: null,
		password: null,
		passwordConfirm: null,
		code: null,
		usernameR: null,
		passwordR: null,
		passwordConfirmR: null,
		codeR: null,
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	resetPass = (e) => {
		const { username, password, passwordConfirm, code } = this.state
		this.setState({
			usernameR: null,
			passwordR: null,
			passwordConfirmR: null,
			codeR: null,
		})
		if (password !== passwordConfirm) {
			this.setState({
				passwordConfirmR: lang.passwordAreDifferent[this.props.l],
			})
		}
		const data = {
			username,
			password,
			code,
		}
		console.log(data)
		this.props.selectAuth(100)
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	render() {
		const { usernameR, passwordR, passwordConfirmR, codeR } = this.state
		const { l } = this.props
		return (
			<form className="authForm" onChange={this.handleChange}>
				<TextField
			    	floatingLabelText={lang.username[l]}
					name="username"
					type="text"
					errorText={usernameR}
					{...textFieldSet}
    			/>
				<TextField
			    	floatingLabelText={lang.code[l]}
					name="code"
					type="text"
					errorText={codeR}
					{...textFieldSet}
    			/>
				<TextField
			    	floatingLabelText={lang.password[l]}
					name="password"
					type="password"
					errorText={passwordR}
					{...textFieldSet}
    			/>
				<TextField
			    	floatingLabelText={lang.passwordConfirm[l]}
					name="passwordConfirm"
					type="password"
					errorText={passwordConfirmR}
					{...textFieldSet}
    			/>
				<FlatButton
					label={lang.RESETPASS[l]}
					style={{ width: '80%', marginTop: '20px' }}
					onClick={this.resetPass}
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

export default connect(mapStateToProps, matchDispatchToProps)(ResetPassForm)
