const l = localStorage.getItem('lang');
const defaultState = {
	l: l > 0 && l < 2 ? l : 0,
}

export default (state = defaultState, action) => {
	switch (action.type) {
		case 'CHANGE_LANG':
			return state.l = action.payload
		default:
			return state
	}
}
