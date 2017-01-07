import React											from 'react'
import { connect }								from 'react-redux'
import browserHistory							from 'react-router/lib/browserHistory'
import _													from 'lodash'
import { animateScroll }					from 'react-scroll'
import api												from '../../apiCall'
import { goMoviePage, bIn, bOut }	from '../../action/body'
import lang												from '../../lang'
import * as pending								from '../../action/pending'

import Chip												from 'material-ui/Chip'
import VideoPlayer								from '../../components/VideoPlayer'
import EpisodeSelector						from '../../components/EpisodeSelector'
import MiniMovie									from '../../components/MiniMovie'
import noImage										from '../../../public/No-image-found.jpg'

import './sass/movie.sass'

const chipStyle = {
	backgroundColor: '#D0D0D0',
}

class Movie extends React.Component {
	_mounted = false

	state = {
		data: null,
		suggestions: null,
		serie: false,
		selectedEpisode: {
			season: 0,
			episode: 0,
		}
	}

	/*
	*	just return the first available episode
	*	and season of the serie
	*/
	getFirstAvailable = (seasons) => {
		if (!seasons || !seasons.length) return false
		return {
			season: seasons[0].season,
			episode: seasons[0].episodes[0].episode
		}
	}

	/*
	*	fetch data from api using id in props.params
	*/
	getData = async (props) => {
		const { dispatch } = this.props

		dispatch(pending.set())
		const { data } = await api.getMovie(props.params.id, props.l)
		dispatch(pending.unset())

		if (!this._mounted) return false
		dispatch(bIn())
		if (data.status.includes('success')) {
			this.setState({
				data: data.result,
				suggestions: data.suggestions,
				serie: !!data.result.seasons && !!data.result.seasons.length,
				selectedEpisode: this.getFirstAvailable(data.result.seasons)
			}, async () => {
				let serieInfo = null;
				if (this.state.serie) {
					serieInfo = {
						ep: this.state.selectedEpisode.episosode,
						season: this.state.selectedEpisode.season,
					}
				}
				const stream = await api.getStream(data.result._id, serieInfo)
				console.log(stream);
			})
		} else browserHistory.push('/')
	}

	componentDidMount() {
		this._mounted = true
		this.getData(this.props)
	}

	/*
	*	If the client clicks on a suggestion, we will get a new id
	*	on location.params.id, so we need to fetch all the data
	*	about this movie from the api. Then we
	*	set data to null to show the loading animation
	*	during fetch
	*/
	componentWillReceiveProps = (newProps) => {
		if (newProps.params.id !== this.props.params.id) {
			this.props.dispatch(bIn())
			this.setState({ data: null })
			this.getData(newProps)
		}
	}

	componentWillUnmount() { this._mounted = false }

	/*
	*	If the client clicks on a category
	*/
	searchCat = (cat) => {
		const { dispatch } = this.props
		dispatch(bOut())
		setTimeout(() => browserHistory.push(`/ht/search?category=${cat}`), 500)
	}

	/*
	*	We force a scroll to the top before redirecting
	*	the client because we're already on the movie page
	*	and we just receive new props, the main container
	*	will not disappear
	*/
	goMovie = (id) => {
		animateScroll.scrollTo(0)
		goMoviePage(id, this.props.dispatch)
	}


	/*
	*	Drawing methods
	*/
	drawSuggest = () => this.state.suggestions.map((el) =>
		<MiniMovie key={el.id} data={el} click={() => this.goMovie(el.id)} />
	)

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

	updateSelected = (selected) => this.setState({ selectedEpisode: selected })

	/*
	*	These methods gets the next or prev episode
	*	using the episodes list and the actual selected episode
	*/
	next = (i, j) => {
		const episodesList = this.state.data.seasons
		if (episodesList[i].episodes[j + 1]) {
			this.updateSelected({
				season: episodesList[i].episodes[j + 1].season,
				episode: episodesList[i].episodes[j + 1].episode,
			})
		} else if (episodesList[i + 1] && episodesList[i + 1].episodes[0]) {
			this.updateSelected({
				season: episodesList[i + 1].episodes[0].season,
				episode: episodesList[i + 1].episodes[0].episode,
			})
		}
	}
	prev = (i, j) => {
		const episodesList = this.state.data.seasons
		if (j - 1 > -1) {
			this.updateSelected({
				season: episodesList[i].episodes[j - 1].season,
				episode: episodesList[i].episodes[j - 1].episode,
			})
		} else if (i - 1 > -1) {
			const {
				episode,
				season
			} = episodesList[i - 1].episodes[episodesList[i - 1].episodes.length - 1]
			this.updateSelected({ episode, season })
		}
		return false
	}

	/*
	*	iterates through all the episodes and call cb when we reach
	*	the actual selected episode
	*/
	eachEp = (cb) => {
		const { selectedEpisode } = this.state
		const episodesList = this.state.data.seasons
		const { episode: sEp, season: sSeas } = selectedEpisode
		episodesList.forEach((season, i) =>
			season.episodes.forEach((episode, j) => {
				if (episode.episode === sEp && episode.season === sSeas) {
					cb(i, j)
				}
			}
		))
	}

	render() {
		const { data, selectedEpisode, serie, src } = this.state
		const { l, mainColor, dispatch } = this.props
		if (!data) return (<div className="comp movie"/>)
		return (
			<div className="comp movie">
				<VideoPlayer src={src} mainColor={mainColor} l={l} dispatch={dispatch}/>
				<div className="filmData">
					<div
						className="poster"
						style={{ backgroundImage: `url('${data.poster}'), url('${noImage}')` }}
					/>
					<div className="afterPoster">
						{serie && <EpisodeSelector
							selectedEpisode={selectedEpisode}
							episodesList={data.seasons}
							onEpisodeSelect={this.updateSelected}
							onClickNext={() => this.eachEp(this.next)}
							onClickPrev={() => this.eachEp(this.prev)}
							l={l}
						/>}
						<h1>{data.title}</h1>
						<div className="rate">
							<i className="material-icons">stars</i>
							<h4>{data.rating}</h4>
						</div>
						<h3>{lang.year[l]} {data.year}</h3>
						<p className="plot">{data.plot}</p>
						<ul className="genres">
							{this.drawGenre()}
						</ul>
					</div>
				</div>
				<h3 className="ymal">{lang.youMayAlsoLike[l]}</h3>
				<ul className="suggestions">
					{this.drawSuggest()}
				</ul>
			</div>
		)
	}
}

const mapStateToProps = ({ lang, theme }) => ({
	l: lang.l,
	mainColor: theme.mainColor,
})

export default connect(mapStateToProps)(Movie)
