import React					from 'react'
import { render }				from 'react-dom'
import { createStore }			from 'redux'
import injectTapEventPlugin		from 'react-tap-event-plugin'
// import { animateScroll }		from 'react-scroll'
import reducers					from './reducers'

import { Provider }				from 'react-redux'
import HyperRouter				from './HyperRouter'

import './master.sass'

injectTapEventPlugin()
const store = createStore(reducers)

// let clientTop = 0
//
// const handleScroll = (e) => {
// 	e = e || window.event
// 	if (e.preventDefault) e.preventDefault()
// 	e.returnValue = false
// 	if (e.code === 'ArrowDown') {
// 		clientTop += 310
// 	} else if (e.code === 'ArrowUp') {
// 		clientTop -= 310
// 	} else {
// 		clientTop += e.deltaY > 0 ? 155 : -155
// 	}
// 	if (clientTop < 0) clientTop = 0
// 	animateScroll.scrollTo(clientTop, { duration: 200 })
// }
//
// if (window.addEventListener) window.addEventListener('DOMMouseScroll', handleScroll, false);
// window.onwheel = handleScroll;
// window.onmousewheel = document.onmousewheel = handleScroll;
// // window.ontouchmove = handleScroll;
// window.onkeydown = (e) => {
// 	if (e.keyCode === 40 || e.keyCode === 38) handleScroll(e)
// }

render(
	<Provider store={store}>
		<HyperRouter />
	</Provider>,
	document.getElementById('root')
)
