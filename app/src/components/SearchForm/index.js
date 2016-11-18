import React			from 'react'
import { connect }		from 'react-redux'
import lang				from '../../lang'

import IconButton		from 'material-ui/IconButton'

import './searchForm.sass'

class SearchForm extends React.Component {
	_mounted = false

	state = {
		focused: false,
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	updateFocus = () => this.setState({ focused: !this.state.focused })

	searchFilm = (e) => {
		e.preventDefault()
		if (e.type === 'change') {
			console.log('change')
		} else {
			console.log('submit')
		}
	}

	render() {
		const { focused } = this.state
		return (
			<form className={`searchForm ${focused ? 'isFocused' : ''}`} onSubmit={this.searchFilm}>
				<IconButton onClick={this.searchFilm}>
					<i className="material-icons">search</i>
				</IconButton>
				<input
					type="text"
					placeholder={lang.typeHereAnyMovieName[this.props.l]}
					className="searchInput"
					onFocus={this.updateFocus}
					onBlur={this.updateFocus}
					onChange={this.searchFilm}
				/>
				<input type="submit" hidden={true} />
			</form>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		l: state.lang.l
	}
}

export default connect(mapStateToProps)(SearchForm)
