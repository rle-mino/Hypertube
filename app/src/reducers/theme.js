import colors				from '../colors/colors'

const defaultState = {
	mainColor: localStorage.getItem('mainColor') || colors.red,
	secondaryColor: localStorage.getItem('mainColor') || colors.blueGrey,
}

const updateMainColor = (state, newColor) => {
	localStorage.setItem('mainColor', newColor)
	return {
		...state,
		mainColor: newColor
	}
}

const updateSecondaryColor = (state, newColor) => {
	localStorage.setItem('secondaryColor', newColor)
	return {
		...state,
		secondaryColor: newColor,
	}
}

export default (state = defaultState, action) => {
	switch (action.type) {
		case 'UPDATE_MAIN_COLOR':
			return updateMainColor(state, action.payload)
		case 'UPDATE_SECONDARY_COLOR':
			return updateSecondaryColor(state, action.payload)
		default:
			return state
	}
}
