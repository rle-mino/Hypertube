import React				from 'react'
import { connect }			from 'react-redux'
import lang					from '../../lang'
import textFieldSet			from '../textFieldSet'

import TextField			from 'material-ui/TextField'
import FlatButton			from 'material-ui/FlatButton'

class ForgotPassForm extends React.Component {
	render() {
		const { l } = this.props
		return (
			<form className="authForm" onChange={this.handleChange}>
				<TextField
			    	floatingLabelText={lang.mail[l]}
					name="mail"
					type="text"
					{ ...textFieldSet }
    			/>
				<FlatButton
					label={lang.SENDMEANEMAIL[l]}
					style={{ width: '80%', marginTop: '20px' }}
					onClick={this.forgot}
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

export default connect(mapStateToProps)(ForgotPassForm)
