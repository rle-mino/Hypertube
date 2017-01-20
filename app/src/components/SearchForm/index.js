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


	focusSearch = () => {
		const searchInput = this._searchInput
		if (searchInput) searchInput.focus()
	}

	/*
	*		When the component is mounted, we setup MouseTrap
	*		to automatically focus the search input on keydown (alphabet only)
	*/
	componentDidMount() {
		this._mounted = true
		MouseTrap.bind(alphabet, this.focusSearch)
		if (this.props.location.pathname.includes('/ht/search')) {
			this.setState({ searchView: true })
		}
	}

	/*
	*		disables mouseTrap when the component is unmounted
	*/
	componentWillUnmount() {
		this._mounted = false
		MouseTrap.unbind(alphabet, this.focusSearch)
	}

	componentWillMount() {
		this.debounceSearchFilm = _.debounce(this.debounceSearchFilm, 300)
	}

	/*
	*		If the new user switch to the search page, the search block
	*		go down to render only one search input
	*/
	componentWillReceiveProps = (newProps) => {
		if (newProps.location.pathname.includes('/ht/search')) {
			this.setState({ searchView: true, results: [] })
		} else if (this.state.searchView) {
			this.setState({ searchView: false })
		}
	}

	/*
	*		Triggered on focus/blur
	*		we reset 'selected' and update focused
	*		to know if we need to render the results list
	*/
	updateFocus = (e) => {
		if (e.type.includes('blur')) {
			setTimeout(() => this.setState({ focused: !this.state.focused, selected: -1 }), 200)
		} else {
			this.setState({ focused: !this.state.focused })
		}
	}


	/*
	*		search for a movie using the written title
	*/
	debounceSearchFilm = async (e) => {
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

	/*
	*		Triggered when the input changes.
	*		We update the input's value and we call
	*		a debounced function which will search for a movie
	*		with the written title
	*/
	searchFilm = (e) => {
		if (e.target.value.length > 200) {
			e.target.value = '';
		}
		this.setState({ title: e.target.value })
		e.persist()
		this.debounceSearchFilm(e)
	}


	/*
	*		Triggered when the user submit.
	*		We directly redirect the user if
	*		an element is selected from results,
	*		else we just redirect to the search page with
	*		the written title
	*/
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

	/*
	*		We select an element from results
	*		when the user press up or down key,
	*		we do nothing if the key pressed is enter,
	*		and we reset selected (-1) if the user press
	*		any other key
	*/
	updateSelected = (e) => {
		if (e.keyCode === 40 || e.keyCode === 38) {
			e.preventDefault()

			const { selected, results } = this.state

			if (!results.length) return false
			let newSelected = -1
			// DOWN
			if (e.keyCode === 40) {
				newSelected = selected === results.length -1 ? results.length -1 : selected + 1
			// UP
			} else if (e.keyCode === 38) {
				newSelected = selected === -1 ? -1 : selected - 1
			}
			this.setState({ selected: newSelected })
		} else if (e.keyCode !== 13) this.setState({ selected: -1 })
	}

	/*
	*		DRAWING METHOD
	*/
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
