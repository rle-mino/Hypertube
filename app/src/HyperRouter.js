import React											from 'react'
import { Router, Route, IndexRoute, browserHistory }	from 'react-router'
import MuiThemeProvider									from 'material-ui/styles/MuiThemeProvider'

import Auth												from './containers/auth'
import LoginForm										from './containers/auth/Login/LoginForm'
import RegisterForm										from './containers/auth/Register/RegisterForm'
import ForgotPassForm									from './containers/auth/Forgot/ForgotPassForm'
import ResetPassForm									from './containers/auth/ResetPass/ResetPassForm'
import HeadAndFoot										from './containers/HeadAndFoot'
import Search											from './containers/Search'

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
				<Route path="/ht" component={HeadAndFoot}>
					<Route path="search" component={Search}/>
				</Route>
			</Router>
		</MuiThemeProvider>
	)
}
