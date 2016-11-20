import React				from 'react'
import { connect }			from 'react-redux'
import axios				from 'axios'
import apiConnect			from '../../apiConnect'

import SearchFormDetailed	from '../../components/SearchFormDetailed'

class Search extends React.Component {
	_mounted = false

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	requestFilms = (reqSet) => {
		axios.get(`${apiConnect}/api/movie/search`, reqSet)
			.then(({ data }) => {
				this.setState({  })
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

	// drawResults = () => this.state.results.map((result) => )

	render() {
		const { l } = this.props
		return (
			<div className="comp searchComp">
				<SearchFormDetailed l={l}/>
				<div className="resultsContainer">
					{/* {this.drawResults()} */}
				</div>
			</div>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(Search)
