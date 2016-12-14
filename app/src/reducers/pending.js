export default (state = false, action) => {
	switch (action.type) {
		case 'set':
			return true
		case 'unset':
			return false
		default:
			return false
	}
}
