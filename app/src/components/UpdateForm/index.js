import React			from 'react'
import lang				from '../../lang'

import TextField		from 'material-ui/TextField'

export default class UpdateForm extends React.Component {
	getFieldProps = () => {
		const { mainColor } = this.props
		return {
			className: 'textInp',
			autoComplete: 'off',
			floatingLabelFocusStyle: { color: mainColor },
			underlineFocusStyle: { borderColor: mainColor },
		}
	}

	render() {
		const { firstname, lastname, mail, l, errors } = this.props
		const { firstnameR, lastnameR, mailR, passwordR, serverResponse } = errors
		if (!firstname || !lastname || !mail) return <div />
		return (
			<form onChange={this.props.handleChange} className="updateForm">
				<div className="serverResponse">{serverResponse}</div>
				<TextField
					floatingLabelText={lang.lastname[l]}
					name="lastname"
					type="text"
					errorText={lastnameR}
					defaultValue={lastname}
					{...this.getFieldProps()}
				/>
				<TextField
					floatingLabelText={lang.firstname[l]}
					name="firstname"
					type="text"
					errorText={firstnameR}
					defaultValue={firstname}
					{...this.getFieldProps()}
				/>
				<TextField
					floatingLabelText={lang.mail[l]}
					name="mail"
					type="mail"
					errorText={mailR}
					defaultValue={mail}
					{...this.getFieldProps()}
				/>
				<TextField
					floatingLabelText={`${lang.password[l]}*`}
					name="password"
					type="password"
					errorText={passwordR}
					{...this.getFieldProps()}
				/>
			</form>
		)
	}
}
