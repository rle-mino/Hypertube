import React					from 'react'
import { render }				from 'react-dom'
import { createStore }			from 'redux'
import injectTapEventPlugin		from 'react-tap-event-plugin'

import reducers					from './reducers'

import { Provider }				from 'react-redux'
import HyperRouter				from './HyperRouter'

import './master.sass'

injectTapEventPlugin()

const store = createStore(reducers)

render(
	<Provider store={store}>
		<HyperRouter />
	</Provider>,
	document.getElementById('root')
)
