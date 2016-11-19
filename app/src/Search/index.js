import React				from 'react'
import { connect }			from 'react-redux'
import axios				from 'axios'
import apiConnect			from '../apiConnect'

import SearchFormDetailed	from './SearchFormDetailed'

class Search extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	requestFilms = (data) => {
		axios.get(`${apiConnect}/api/movie/search`, data)
			.then(({ data }) => {
				console.log(data)
			}
		)
	}

	componentWillMount() {
		this.requestFilms({ params: { title: this.props.location.query.title } })
	}

	componentWillReceiveProps = (newProps) => {
		this.requestFilms({ params: { title: newProps.location.query.title } })
	}

	render() {
		return (
			<div className="comp searchComp">
				<SearchFormDetailed />
			</div>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(Search)
