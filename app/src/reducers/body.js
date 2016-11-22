export default (state = '', action) => {
	switch (action.type) {
		case 'BODY_OUT':
			return state = 'bodyOut'
		case 'BODY_IN':
			return state = ''
		default:
			return state
	}
}
