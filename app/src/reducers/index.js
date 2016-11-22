import { combineReducers }			from 'redux'
import themeReducer					from './theme'
import langReducer					from './lang'
import authReducer					from './auth'
import bodyReducer					from './body'

export default combineReducers({
	theme: themeReducer,
	lang: langReducer,
	auth: authReducer,
	body: bodyReducer,
})
