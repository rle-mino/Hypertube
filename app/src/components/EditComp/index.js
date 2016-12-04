import React			from 'react'
import lang				from '../../lang'
import api				from '../../apiCall'

import Dialog			from 'material-ui/Dialog'
import FlatButton		from 'material-ui/FlatButton'
import UpdateForm		from '../UpdateForm'

export default class EditComp extends React.Component {
	_mounted = false

	state = {
		open: false,
		errors: {},
		firstname: '',
		lastname: '',
		mail: '',
		password: '',
	}

	componentWillMount() {
		const { firstname, lastname, mail } = this.props
		this.setState({ firstname, lastname, mail })
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	handleOpen = () => {
		this.setState({ open: true });
	}

	handleClose = () => {
		this.setState({ open: false });
	}

	updateProf = async () => {
		const { firstname, lastname, mail, password } = this.state
		const cred = {
			firstname,
			lastname,
			mail,
			password,
		}
		const { l } = this.props
		const { data } = await api.updateProfile(cred)
		this.setState({ errors: {} })
		if (data.status.includes('error')) {
			if (data.details.includes('invalid request')) {
				const errors = {}
				data.error.forEach((el) => {
					if (!errors[`${el.path}R`]) {
						errors[`${el.path}R`] = lang.errorP[el.type][l]
					}
				})
				this.setState({ errors })
			} else if (data.details.includes('wrong password')) {
				this.setState({ errors: { serverResponse: lang.wrongPassword[l] } })
			} else if (data.details.includes('mail already used')) {
				this.setState({ errors: { mailR: lang.alreadyUsed[l] } })
			} else this.setState({ errors: { serverResponse : lang.error[l] } })
		} else {
			this.props.onUpdate()
			this.setState({ open: false })
		}
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	render() {
		const { l, firstname, lastname, mail, mainColor } = this.props
		const { errors, open } = this.state
		return (
			<div>
				<FlatButton
					label={lang.update[l]}
					onTouchTap={this.handleOpen}
					className="updateButton"
					style={{ width: '100%' }}
				/>
				<Dialog
					title={lang.updateYourProfile[l]}
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
							onTouchTap={this.updateProf}
							style={{ color: mainColor }}
						/>,
					]}
				>
					<UpdateForm
						firstname={firstname}
						lastname={lastname}
						mail={mail}
						l={l}
						mainColor={mainColor}
						handleChange={this.handleChange}
						errors={errors}
					/>
				</Dialog>
			</div>
		)
	}
}
