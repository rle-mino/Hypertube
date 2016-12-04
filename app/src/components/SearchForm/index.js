import React							from 'react'
import _								from 'lodash'
import { browserHistory }				from 'react-router'
import { goMoviePage, bOut }			from '../../action/body'
import api								from '../../apiCall'
import lang								from '../../lang'

import IconButton						from 'material-ui/IconButton'
import { List }							from 'material-ui/List'
import LargeMovie						from '../LargeMovie'

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

	componentWillUnmount() { this._mounted = false }

	componentWillMount() {
		this.debouncedSearchFilm = _.debounce(this.debouncedSearchFilm, 300)
	}

	componentWillReceiveProps = (newProps) => {
		if (newProps.location.pathname.includes('/ht/search')) {
			this.setState({ searchView: true, results: [] })
		} else if (this.state.searchView) {
			this.setState({ searchView: false })
		}
	}

	updateFocus = (e) => {
		if (e.type.includes('blur')) {
			setTimeout(() => this.setState({ focused: !this.state.focused }), 200)
		} else {
			this.setState({ focused: !this.state.focused })
		}
	}

	debouncedSearchFilm = async (e) => {
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

	searchFilm = (e) => {
		this.setState({ title: e.target.value })
		e.persist()
		this.debouncedSearchFilm(e)
	}

	handleSubmit = (e) => {
		e.preventDefault()
		if (this.props.location.pathname.includes('/ht/search')) {
			browserHistory.push(`/ht/search?title=${this.state.title}`)
		} else {
			this.props.dispatch(bOut())
			this.setState({ results: [] })
			setTimeout(() => browserHistory.push(`/ht/search?title=${this.state.title}`), 500)
		}
	}

	drawResultsList = () => {
		const { results } = this.state
		const { dispatch } = this.props
		return results ?
			results.map((el) => <LargeMovie
				key={el.id}
				data={el}
				click={() => goMoviePage(el.id, dispatch)} />) :
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
						onChange={this.searchFilm}
						value={title}
						autoComplete="off"
					/>
					<input type="submit" hidden={true} />
				</form>
				{(results && results.length && focused &&
					<List style={{ position: 'absolute' }} className="fastSearchList">
						{this.drawResultsList()}
					</List>) || <div />
				}
			</div>
		)
	}
}
