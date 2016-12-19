module.exports = function BuildWhiteList(whitelist) {
	if (!Array.isArray(whitelist)) throw new Error('Invalid whitelist')

	return (message, contact, next) => {
		if (whitelist.indexOf(contact.nodeID) === -1) {
			return next (new Error('Contact is not in the whitelist'))
		}

		next()
}
