import React				from 'react'
import _					from 'lodash'
import { browserHistory }	from 'react-router'
import * as bodyDis			from '../../action/body'
import api					from '../../apiCall'
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
		title: '',
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

	searchFilm = async (e) => {
		if (this.state.searchView) return false
		if (!e.target.value || e.target.value.length < 1) {
			this.setState({ results: [] })
		}
		const { data } = await api.fastSearch({
			params: { title: e.target.value }
		})
		if (data.status.includes('success')) {
			this.setState({ results: data.results })
		}
	}

	debouncedSearchFilm = (e) => {
		this.setState({ title: e.target.value })
		e.persist()
		this.searchFilm(e)
	}

	handleSubmit = (e) => {
		e.preventDefault()
		if (this.props.location.pathname.includes('/ht/search')) {
			browserHistory.push(`/ht/search?title=${this.state.title}`)
		} else {
			this.props.dispatch(bodyDis.bOut())
			this.setState({ results: [] })
			setTimeout(() => {
				this.props.dispatch(bodyDis.bIn())
				browserHistory.push(`/ht/search?title=${this.state.title}`)
			}, 500)
		}
	}

	createResultsList = () => {
		const { results } = this.state
		return results ?
			results.map((el) => <LargeMovie key={el.id} data={el} />) :
			<div></div>
	}

	render() {
		const { focused, results, searchView, title } = this.state
		return (
			<div className={`searchBlock ${searchView ? 'searchView' : ''}`}>
				<form className={`searchForm ${focused ? 'isFocused' : ''}`} onSubmit={this.handleSubmit}>
					<IconButton onTouchTap={this.handleSubmit}>
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
						value={title}
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
