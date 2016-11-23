const anon = {
    newId: () => {
        return 'Hypertube' + Math.random() * 10000 + '-' + Math.random() * 999
    }
}

module.exports = anon