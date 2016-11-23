import crypto from 'crypto'

let id = null

const anon = {
    newId: () => {
        if (!id) {
            id = crypto.randomBytes(20)
            Buffer.from('-HyperTube0001-').copy(id, 0)
        }
        return id
    }
}

module.exports = anon