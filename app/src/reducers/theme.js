const defaultState = {
	mainColor: '#f44336',
	secondaryColor: '#607d8b',
}

export default (state = defaultState, action) => {
	switch (action.type) {
		case 'GET_MAIN_COLOR':
			return state.mainColor
		case 'UPDATE_MAIN_COLOR':
			return state.mainColor = action.payload
		case 'GET_SECONDARY_COLOR':
			return state.secondaryColor
		case 'UPDATE_SECONDARY_COLOR':
			return state.secondaryColor = action.payload
		default:
			return state
	}
}
