import React											from 'react'
import { Router, Route, IndexRoute, browserHistory }	from 'react-router'
import MuiThemeProvider									from 'material-ui/styles/MuiThemeProvider'

import Auth												from './auth'
import LoginForm										from './auth/Login/LoginForm'
import RegisterForm										from './auth/Register/RegisterForm'
import ForgotPassForm									from './auth/Forgot/ForgotPassForm'
import ResetPassForm									from './auth/ResetPass/ResetPassForm'
import HeadAndFoot										from './HeadAndFoot'

export default () => {
	return (
		<MuiThemeProvider>
			<Router history={browserHistory}>
				<Route path="/" component={Auth}>
					<IndexRoute component={LoginForm} />
					<Route path="register" component={RegisterForm} />
					<Route path="forgot" component={ForgotPassForm} />
					<Route path="reset_password" component={ResetPassForm} />
				</Route>
				<Route path="/ht/" component={HeadAndFoot}>
					{/* <IndexRoute component={LoginForm} /> */}
				</Route>
			</Router>
		</MuiThemeProvider>
	)
}
