import React					from 'react'
import { connect }				from 'react-redux'
import api						from '../../../apiCall'
import { selectAuth }			from '../../../action/auth'
import lang						from '../../../lang'
import colors					from '../../../colors/colors'

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
		username: '',
		password: '',
		passwordConfirm: '',
		passToken: '',
		usernameR: null,
		passwordR: null,
		passwordConfirmR: null,
		passTokenR: null,
		serverResponse: null,
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	resetPass = async (e) => {
		const { username, password, passwordConfirm, passToken } = this.state
		const { dispatch, l } = this.props
		this.setState({
			usernameR: null,
			passwordR: null,
			passwordConfirmR: null,
			passTokenR: null,
			serverResponse: null,
		})

		if (password !== passwordConfirm) {
			this.setState({
				passwordConfirmR: lang.passwordAreDifferent[this.props.l],
			})
			return false
		}
		const cred = {
			username,
			password,
			passToken,
		}
		const { data } = await api.resetPass(cred)
		if (data.status && data.status.includes('error')) {
			if (data.details.includes('invalid request')) {
				const errors = {}
				data.error.forEach((el) => {
					if (!errors[`${el.path}R`]) {
						errors[`${el.path}R`] = lang.errorP[el.type][l]
					}
				})
				this.setState({ ...errors })
			} else if (data.details.includes('wrong code')) {
				this.setState({ serverResponse: lang.wrongCode[l] })
			} else if (data.details.includes('user doesnt exist')) {
				this.setState({ serverResponse: lang.userDoesntExistAl[l] })
			}
		} else {
			dispatch(selectAuth(0))
		}
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	checkSub = (e) => { if (e.keyCode === 13) this.resetPass() }

	render() {
		const {
			usernameR,
			passwordR,
			passwordConfirmR,
			passTokenR,
			serverResponse,
		} = this.state
		const { l } = this.props
		return (
			<form className="authForm" onChange={this.handleChange} onKeyDown={this.checkSub}>
				<div className="serverResponse">{serverResponse}</div>
				<TextField
			    	floatingLabelText={lang.username[l]}
					name="username"
					type="text"
					errorText={usernameR}
					autoFocus={true}
					{...textFieldSet}
    			/>
				<TextField
			    	floatingLabelText={lang.code[l]}
					name="passToken"
					type="text"
					errorText={passTokenR}
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

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(ResetPassForm)
