const l = localStorage.getItem('lang');
const defaultState = {
	l: l > 0 && l < 2 ? l : 0,
}

const updateLang = (newValue, state) => {
	if (newValue < 0 || newValue > 1) newValue = 0
	localStorage.setItem('lang', newValue)
	state.l = newValue
	const newState = { ...state, l: newValue }
	return newState
}

export default (state = defaultState, action) => {
	switch (action.type) {
		case 'UPDATE_LANG':
			return updateLang(action.payload, state)
		default:
			return state
	}
}
