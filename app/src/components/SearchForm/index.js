import React				from 'react'
import _					from 'lodash'
import { browserHistory }	from 'react-router'
import axios				from 'axios'
import apiConnect			from '../../apiConnect'
import lang					from '../../lang'

import IconButton			from 'material-ui/IconButton'
import { List }				from 'material-ui/List'
import LargeMovie			from '../LargeMovie'

import './searchForm.sass'

export default class SearchForm extends React.Component {
	_mounted = false

	state = {
		focused: false,
		results: [],
		searchView: false,
	}

	componentDidMount() {
		this._mounted = true
		if (this.props.location.pathname.includes('/ht/search')) {
			this.setState({ searchView: true })
		}
	}

	componentWillUnmount() {
		this._mounted = false
	}

	componentWillMount() {
		this.searchFilm = _.debounce(this.searchFilm, 300)
	}

	componentWillReceiveProps = (newProps) => {
		if (newProps.location.pathname.includes('/ht/search')) {
			this.setState({ searchView: true, results: [] })
		} else if (this.state.searchView) {
			this.setState({ searchView: false })
		}
	}

	updateFocus = () => this.setState({ focused: !this.state.focused })

	searchFilm = (e) => {
		if (this.state.searchView) return false
		if (!e.target.value || e.target.value.length < 1) {
			this.setState({ results: [] })
		}
		axios.get(`${apiConnect}/api/movie/fast_search`, {
			params: {
				title: e.target.value
			}
		}).then(({ data }) => {
			this.setState({ results: data.results })
		})
	}

	debouncedSearchFilm = (e) => {
		e.persist()
		this.searchFilm(e)
	}

	handleSubmit = (e) => {
		e.preventDefault()
		browserHistory.push(`/ht/search?title=${e.target.title.value}`)
	}

	createResultsList = () => {
		const { results } = this.state
		return results ?
			results.map((el) => <LargeMovie key={el.id} data={el} />) :
			<div></div>
	}

	render() {
		const { focused, results, searchView } = this.state
		return (
			<div className={`searchBlock ${searchView ? 'searchView' : ''}`}>
				<form className={`searchForm ${focused ? 'isFocused' : ''}`} onSubmit={this.handleSubmit}>
					<IconButton onClick={this.searchFilm}>
						<i className="material-icons">search</i>
					</IconButton>
					<input
						type="text"
						placeholder={lang.typeHereAnyMovieName[this.props.l]}
						className="searchInput"
						name="title"
						onFocus={this.updateFocus}
						onBlur={this.updateFocus}
						onChange={this.debouncedSearchFilm}
						autoComplete="off"
					/>
					<input type="submit" hidden={true} />
				</form>
				{(results && results.length && focused &&
					<List style={{ position: 'absolute' }} className="fastSearchList">
						{this.createResultsList()}
					</List>) || <div />
				}
			</div>
		)
	}
}
