import React							from 'react'
import _								from 'lodash'
import browserHistory					from 'react-router/lib/browserHistory'
import MouseTrap						from 'mousetrap'
import { goMoviePage, bOut }			from '../../action/body'
import * as pending						from '../../action/pending'
import api								from '../../apiCall'
import lang								from '../../lang'

import IconButton						from 'material-ui/IconButton'
import { List }							from 'material-ui/List'
import LargeMovie						from '../LargeMovie'

import './searchForm.sass'

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default class SearchForm extends React.Component {
	_mounted = false

	state = {
		focused: false,
		results: [],
		searchView: false,
		title: '',
		selected: -1,
	}

	_searchInput = null

	componentDidMount() {
		this._mounted = true
		MouseTrap.bind(alphabet, this.focusSearch)
		if (this.props.location.pathname.includes('/ht/search')) {
			this.setState({ searchView: true })
		}
	}

	focusSearch = () => {
		const searchInput = this._searchInput
		if (searchInput) searchInput.focus()
	}

	componentWillUnmount() {
		this._mounted = false
		MouseTrap.unbind(alphabet, this.focusSearch)
	}

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
			setTimeout(() => this.setState({ focused: !this.state.focused, selected: -1 }), 200)
		} else {
			this.setState({ focused: !this.state.focused })
		}
	}

	debouncedSearchFilm = async (e) => {
		if (this.state.searchView) return false
		if (!e.target.value || e.target.value.length < 1) {
			this.setState({ results: [] })
		}

		this.props.dispatch(pending.set())
		const { data } = await api.fastSearch({
			params: { title: e.target.value }
		})
		this.props.dispatch(pending.unset())

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
			const { selected, results } = this.state
			this.props.dispatch(bOut())
			this.setState({ results: [] })
			if (selected !== -1) {
				goMoviePage(results[selected].id, this.props.dispatch)
			} else {
				setTimeout(() => browserHistory.push(`/ht/search?title=${this.state.title}`), 500)
			}
		}
	}

	updateSelected = (e) => {
		if (e.keyCode === 40 || e.keyCode === 38) {
			e.preventDefault()

			const { selected, results } = this.state

			if (!results.length) return false
			let newSelected = -1
			if (e.keyCode === 40) {
				// DOWN
				newSelected = selected === results.length -1 ? results.length -1 : selected + 1
			} else if (e.keyCode === 38) {
				// UP
				newSelected = selected === -1 ? -1 : selected - 1
			}
			this.setState({ selected: newSelected })
		} else if (e.keyCode !== 13) this.setState({ selected: -1 })
	}

	drawResultsList = () => {
		const { results, selected } = this.state
		const { dispatch } = this.props
		if (results) {
			return (results.map((el, key) =>
				<LargeMovie
					key={el.id}
					data={el}
					selected={key === selected}
					click={() => goMoviePage(el.id, dispatch)}
				/>)
			)
		}
		return <div></div>
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
						onKeyDown={this.updateSelected}
						className="searchInput"
						name="title"
						onFocus={this.updateFocus}
						onBlur={this.updateFocus}
						onChange={this.searchFilm}
						value={title}
						autoComplete="off"
						ref={(searchInput) => this._searchInput = searchInput}
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
