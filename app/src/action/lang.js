const selectLang = (value) => {
	return {
		type: 'UPDATE_LANG',
		payload: value,
	}
}

export { selectLang }
