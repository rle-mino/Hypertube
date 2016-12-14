/* eslint semi: ["error", "never"]*/

import chalk from 'chalk'

const log = {
	log: m => console.log(chalk.blue(m)),
	i: m => {
		process.stdout.clearLine()
		process.stdout.cursorTo(0)
		process.stdout.write(chalk.cyan(m))
	},
	e: m => {
		process.stdout.clearLine()
		process.stdout.cursorTo(0)
		process.stdout.write(chalk.red(m))
	},
	y: m => {
		process.stdout.clearLine()
		process.stdout.cursorTo(0)
		process.stdout.write(chalk.yellow(m))
	},
	m: m => {
		process.stdout.clearLine()
		process.stdout.cursorTo(0)
		process.stdout.write(chalk.magenta(m))
	},
	g: m => {
		process.stdout.clearLine()
		process.stdout.cursorTo(0)
		process.stdout.write(chalk.green(m))
	},
	r: m => {
		const r = Math.floor(Math.random() * 4)
		switch (r) {
			case 0: log.i(m)
			break
			case 1: log.g(m)
			break
			case 2: log.y(m)
			break
			case 3: log.m(m)
			break
			case 4: log.m(m)
			break
			default: log.m(m)
			break
		}
	},
	l: m => {
		process.stdout.write(chalk.cyan(m))
	},
}

module.exports = log
