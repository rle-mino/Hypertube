import React				from 'react'
import { connect }			from 'react-redux'
import lang					from '../../lang'
import api					from '../../apiCall'

import SearchFormDetailed	from '../../components/SearchFormDetailed'
import MiniMovie			from '../../components/MiniMovie'

import './sass/search.sass'

class Search extends React.Component {
	_mounted = false

	state  = {
		results: [],
		serverStatus: null
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	requestFilms = async (reqSet) => {
		const { data } = await api.search(reqSet)
		console.log(data);
		if (data.status.includes('success')) {
			this.setState({ results: data.results })
		} else {
			this.setState({ serverStatus: lang.noResultsFound[this.props.l] })
		}
	}

	componentWillMount() {
		this.requestFilms({ params: { title: this.props.location.query.title } })
	}

	componentWillReceiveProps = (newProps) => {
		this.requestFilms({ params: { title: newProps.location.query.title } })
	}

	drawResults = () => {
		const { results } = this.state
		if (!results) return false
		return this.state.results.map((result) =>
			<MiniMovie data={result} key={result.id} />
		)
	}

	render() {
		const { l } = this.props
		const { serverStatus } = this.state
		return (
			<div className="comp searchComp">
				<SearchFormDetailed l={l}/>
				<h3 className="resultsStatus">{serverStatus}</h3>
				<ul className="resultsContainer">
					{this.drawResults()}
				</ul>
			</div>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(Search)
