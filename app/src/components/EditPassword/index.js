import React			from 'react'
import Dialog			from 'material-ui/Dialog'
import FlatButton		from 'material-ui/FlatButton'
import TextField		from 'material-ui/TextField'
import lang				from '../../lang'
import api				from '../../apiCall'

/*
*	add pause and unpause method to mousetrap
*/
import msPause			from 'mousetrap-pause'
import ms				from 'mousetrap'

const MouseTrap = msPause(ms)

export default class EditPassword extends React.Component {
	state = {
		open: false,
		password: '',
		newPassword: '',
		checkPass: '',
		passwordR: null,
		newPasswordR: null,
		checkPassR: null,
		serverResponse: null,
	}

	handleOpen = () => {
		this.setState({ open: true })
		MouseTrap.pause()
	}

	handleClose = () => {
		this.setState({ open: false })
		MouseTrap.unpause()
	}

	componentWillUnmount() {
		MouseTrap.unpause()
	}

	getFieldProps = () => {
		const { mainColor } = this.props
		return {
			className: 'textInp',
			autoComplete: 'off',
			floatingLabelFocusStyle: { color: mainColor },
			underlineFocusStyle: { borderColor: mainColor },
		}
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	updatePass = async (e) => {
		this.setState({
			serverResponse: null,
			passwordR: null,
			newPasswordR: null,
			checkPassR: null,
		})
		const { l } = this.props
		const { password, newPassword, checkPass } = this.state
		if (newPassword !== checkPass) {
			this.setState({ checkPassR: lang.passwordAreDifferent[l] })
			return false
		}
		const cred = {
			password,
			newPassword,
			checkPass,
		}
		const { data } = await api.updatePass(cred)

		if (data.status && data.status.includes('error')) {
			if (data.details.includes('invalid request')) {
				const error = {}
				data.error.forEach((el) => {
					if (!error[`${el.path}R`]) {
						error[`${el.path}R`] = lang.errorP[el.type][l]
					}
				})
				this.setState({ ...error })
			} else if (data.details.includes('wrong password')){
				this.setState({ passwordR: lang.wrongPassword[l] })
			} else this.setState({ serverResponse: lang.error[l] })
		} else {
			this.setState({ open: false });
			this.props.onUpdate()
		}
	}

	checkSub = (e) => {
		if (e.keyCode === 13) this.updatePass()
	}

	render() {
		const { l, mainColor } = this.props
		const { open, serverResponse, passwordR, newPasswordR, checkPassR } = this.state
		return (
			<div>
				<FlatButton
					label={lang.updatePassword[l]}
					onTouchTap={this.handleOpen}
					className="updatePassButton"
					style={{ width: '100%' }}
				/>
				<Dialog
					title={lang.updatePassword[l]}
					modal={false}
					open={open}
					onRequestClose={this.handleClose}
					contentStyle={{ width: '100%' }}
					actions={[
						<FlatButton
							label={lang.cancel[l]}
							primary={true}
							onTouchTap={this.handleClose}
							style={{ color: mainColor }}
						/>,
						<FlatButton
			  				label={lang.save[l]}
							primary={true}
							onTouchTap={this.updatePass}
							style={{ color: mainColor }}
						/>,
					]}
				>
					<form onChange={this.handleChange} className="updateForm" onKeyDown={this.checkSub}>
						<div className="serverResponse">{serverResponse}</div>
						<TextField
							floatingLabelText={lang.oldPassword[l]}
							name="password"
							type="password"
							autoFocus={true}
							errorText={passwordR}
							{...this.getFieldProps()}
						/>
						<TextField
							floatingLabelText={lang.newPassword[l]}
							name="newPassword"
							type="password"
							errorText={newPasswordR}
							{...this.getFieldProps()}
						/>
						<TextField
							floatingLabelText={lang.passwordConfirm[l]}
							name="checkPass"
							type="password"
							errorText={checkPassR}
							{...this.getFieldProps()}
						/>
					</form>
				</Dialog>
			</div>
		)
	}
}
