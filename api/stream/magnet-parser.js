/* eslint semi: ["error", "never"]*/
/**
 * Created by opichou on 11/23/16.
 */
import uniq from 'uniq'
import base32 from 'base32'

function magnetURIDecode (uri) {
    let result = {}

    let data = uri.split('magnet:?')[1]

    let params = (data && data.length >= 0)
        ? data.split('&')
        : []

    params.forEach(params => {
        const keyval = params.split('=')

        if (keyval.length !== 2) return
        const key = keyval[0]
        let val = keyval[1]

        if (key === 'dn') val = decodeURIComponent(val).replace(/\+/g, ' ')

        if (key === 'tr' || key === 'xs' || key === 'ws') {
            val = decodeURIComponent(val)
        }

        if (key === 'kt') val = decodeURIComponent(val).split('+')

        if (key === 'ix') val = Number(val)

        if (result[key]) {
            if (Array.isArray(result[key])) {
                result[key].push(val)
            } else {
                const old = result[key]
                result[key] = [old, val]
            }
        } else {
            result[key] = val
        }
    })

	let tmp

	if (result.xt) {
		const xts = Array.isArray(result.xt) ? result.xt : [result.xt]
		xts.forEach(xt => {
			if ((tmp = xt.match(/^urn:btih:(.{40})/))) {
				result.infoHash = tmp[1].toLowerCase()
			} else if ((tmp = xt.match(/^urn:btih:(.{32})/))) {
				const decodedStr = base32.decode(tmp[1])
				result.infoHash = Buffer.from(decodedStr, 'binary').toString('hex')
			}
		})
	}
	if (result.infoHash) result.infoHashBuffer = Buffer.from(result.infoHash, 'hex')
	if (result.infoHashBuffer) result.infoHashBinary = result.infoHashBuffer.toString('binary')
	if (result.dn) result.name = result.dn
	if (result.kt) result.keywords = result.kt

	if (typeof result.tr === 'string') result.announce = [result.tr]
	else if (Array.isArray(result.tr)) result.announce = result.tr
	else result.announce = []

	result.urlList = []
	if (typeof result.as === 'string' || Array.isArray(result.as)) {
	    result.urlList = result.urlList.concat(result.as)
	}
	if (typeof result.ws === 'string' || Array.isArray(result.ws)) {
	    result.urlList = result.urlList.concat(result.ws)
	}

	uniq(result.announce)
	uniq(result.urlList)

	return result

}

module.exports = magnetURIDecode
