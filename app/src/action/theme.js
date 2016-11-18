const selectMainColor = (value) => {
	return {
		type: 'UPDATE_MAIN_COLOR',
		payload: value,
	}
}

const selectSecondaryColor = (value) => {
	return {
		type: 'UPDATE_SECONDARY_COLOR',
		payload: value,
	}
}

export { selectMainColor, selectSecondaryColor }
