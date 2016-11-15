import React				from 'react'
import { connect }			from 'react-redux'
import lang					from '../../lang'
import textFieldSet			from '../textFieldSet'

import TextField			from 'material-ui/TextField'
import FlatButton			from 'material-ui/FlatButton'

class registerForm extends React.Component {
	render() {
		const { l } = this.props
		return (
			<form className="authForm" onChange={this.handleChange}>
				<TextField
			    	floatingLabelText={lang.username[l]}
					name="username"
					type="text"
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.mail[l]}
					name="mail"
					type="mail"
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.password[l]}
					name="password"
					type="password"
					{ ...textFieldSet }
    			/>
				<TextField
			    	floatingLabelText={lang.passwordConfirm[l]}
					name="passwordConfirm"
					type="password"
					{ ...textFieldSet }
    			/>
				<FlatButton
					label={lang.SIGNUP[l]}
					style={{ width: '80%', marginTop: '20px' }}
					onClick={this.signin}
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

export default connect(mapStateToProps)(registerForm)
