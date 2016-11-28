import bencode from 'bencode'

const y = 'e'
// and e as error array
function BuildError(t, code) {
	const error = {
		201		: 'Generic Error',
		202		: 'Server Error',
		203		: 'Protocol Error',
		204		: 'Method Error'
	}
	let message = {
		t,
		y,
		e	: [
			`${code} ${error[code]}`
		]
	}
	return bencode.encode(message)
}
