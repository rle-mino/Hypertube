import React					from 'react'
import { connect }				from 'react-redux'
import { selectAuth }			from '../../../action/auth'
import lang						from '../../../lang'
import colors					from '../../../colors/colors'

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
		firstname: null,
		lastname: null,
		usernameR: null,
		passwordR: null,
		passwordConfirmR: null,
		mailR: null,
		firstnameR: null,
		lastnameR: null,
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
		const {
			username,
			password,
			passwordConfirm,
			mail,
			firstname,
			lastname,
		} = this.state
		this.setState({
			usernameR: null,
			passwordR: null,
			firstnameR: null,
			lastnameR: null,
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
			mail,
			lastname,
			firstname,
		}
		console.log(data)
		this.props.dispatch(selectAuth(100))
	}

	render() {
		const { l } = this.props
		const {
			usernameR,
			passwordR,
			mailR,
			passwordConfirmR,
			firstnameR,
			lastnameR,
		} = this.state
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
					floatingLabelText={lang.lastname[l]}
					name="lastname"
					type="text"
					errorText={lastnameR}
					{ ...textFieldSet }
				/>
				<TextField
			    	floatingLabelText={lang.firstname[l]}
					name="firstname"
					type="text"
					errorText={firstnameR}
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

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(registerForm)
