import React				from 'react'
import { connect }			from 'react-redux'
import { browserHistory }	from 'react-router'
import _					from 'lodash'
import api					from '../../apiCall'
import lang					from '../../lang'
import * as bodyDis			from '../../action/body'

import Chip					from 'material-ui/Chip'
import CircularProgress		from 'material-ui/CircularProgress'
import MiniMovie			from '../../components/MiniMovie'
import noImage				from '../../../public/No-image-found.jpg'

import './sass/movie.sass'

const chipStyle = {
	backgroundColor: '#D0D0D0',
}

class Movie extends React.Component {
	_mounted = false

	state = {
		data: null,
		suggestions: null,
	}

	getData = async (props) => {
		const { data } = await api.getMovie(props.params.id, props.l)
		if (!this._mounted) return false
		if (data.status.includes('success')) {
			this.setState({ data: data.result, suggestions: data.suggestions })
		} else browserHistory.push('/')
	}

	componentDidMount() {
		this._mounted = true
		this.getData(this.props)
	}

	componentWillReceiveProps = (newProps) => this.getData(newProps)

	componentWillUnmount() { this._mounted = false }

	goMoviePage = (id) => {
		const { dispatch } = this.props
		dispatch(bodyDis.bOut())
		setTimeout(() => {
			browserHistory.push(`/ht/movie/${id}`)
			dispatch(bodyDis.bIn())
		}, 500)
	}

	drawSuggest = () => this.state.suggestions.map((el) =>
		<MiniMovie key={el.id} data={el} click={() => this.goMoviePage(el.id)} />
	)

	searchCat = (cat) => {
		const { dispatch } = this.props
		dispatch(bodyDis.bOut())
		setTimeout(() => {
			browserHistory.push(`/ht/search?category=${cat}`)
			dispatch(bodyDis.bIn())
		}, 500)
	}

	drawGenre = () => this.state.data.genres.map((el, key) => {
		const translation = _.find(lang.categories, (cat) => cat[0] === el)
		return (
			<li key={key}>
				<Chip
					className="chip"
					onTouchTap={() => this.searchCat(el)}
					style={chipStyle}
				>
					{translation ? translation[this.props.l] : el}
				</Chip>
			</li>
		)
	})

	render() {
		const { data } = this.state
		const { l, mainColor } = this.props
		if (!data) return (<CircularProgress color={mainColor} style={{ marginTop: '20px' }} />)
		return (
			<div className="comp movie">
				<div className="playerContainer">
					{/* <Player /> */}
				</div>
				<div className="filmData">
					<h1>{data.title}</h1>
					<div
						className="poster"
						style={{ backgroundImage: `url('${data.poster}'), url('${noImage}')` }}
					/>
					<div className="rate">
						<i className="material-icons">stars</i>
						<h4>{data.rating}</h4>
					</div>
					<h3>{lang.year[l]} {data.year}</h3>
					<p>{data.plot}</p>
					<ul className="genres">
						{this.drawGenre()}
					</ul>
				</div>
				<h3>{lang.youMayAlsoLike[l]}</h3>
				<ul className="suggestions">
					{this.drawSuggest()}
				</ul>
			</div>
		)
	}
}

const mapStateToProps = ({ lang, theme }) => {
	return {
		l: lang.l,
		mainColor: theme.mainColor,
	}
}

export default connect(mapStateToProps)(Movie)
