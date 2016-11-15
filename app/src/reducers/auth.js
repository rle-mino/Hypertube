export default (state = 0, action) => {
	switch (action.type) {
		case 'UPDATE_AUTH':
			return state = action.payload
		default:
			return (state)
	}
}
