import React from 'react'
import './App.sass'

export default class App extends React.Component {
	render() {
		return (
			<div className="App">
				{this.props.children}
			</div>
		)
	}
}
