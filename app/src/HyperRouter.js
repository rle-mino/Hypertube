import React											from 'react'
import { Router, Route, IndexRoute, browserHistory }	from 'react-router'
import MuiThemeProvider									from 'material-ui/styles/MuiThemeProvider'

import App												from './App'
import Login											from './auth/Login'

export default () => {
	return (
		<MuiThemeProvider>
			<Router history={browserHistory}>
				<Route path="/" component={App}>
					<IndexRoute component={Login} />
				</Route>
			</Router>
		</MuiThemeProvider>
	)
}
