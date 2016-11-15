const selectAuth = (value) => {
	return {
		type: 'UPDATE_AUTH',
		payload: value,
	}
}

export { selectAuth }
