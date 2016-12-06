module.exports = function BuildBlackList(blacklist) {
  if(!Array.isArray(blacklist)) throw new Error('Invalid blacklist')

  return (message, contact, next) => {
    if (blacklist.indexOf(contact.nodeID) !== -1) {
      return next(new Error('Contact is in the blacklist'))
    }

    next()
  }
}
