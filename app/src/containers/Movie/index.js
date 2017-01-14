import React											from 'react'
import { connect }								from 'react-redux'
import browserHistory							from 'react-router/lib/browserHistory'
import _													from 'lodash'
import { animateScroll }					from 'react-scroll'
import api												from '../../apiCall'
import { goMoviePage, bIn }				from '../../action/body'
import lang												from '../../lang'
import * as pending								from '../../action/pending'
import apiConnect									from '../../apiConnect'

import VideoPlayer								from '../../components/VideoPlayer'
import CommentSection							from '../../components/CommentSection'
import MiniMovie									from '../../components/MiniMovie'
import FilmData										from '../../components/FilmData'

import './sass/movie.sass'

class Movie extends React.Component {
	_mounted = false

	state = {
		data: null,
		suggestions: null,
		serie: false,
		selectedEpisode: {
			season: 0,
			episode: 0,
		},
		src: null,
		srcTrack: null,
		label: null,
		srcLang: null,
		isMovieRequested: false,
		username: null,
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
	*		Saves the username into the state to know which
	*		user can remove which comment
	*/
	handleProfile = (props) => ({ data }) => {
		if (data.status && data.status.includes('error')) {
			browserHistory.push('/')
			return false
		}
		this.setState({ username: data.profile.username })
		return api.getMovie(props.params.id, props.l)
	}
	
	/*
	*		Saves the movie data into the state
	*/
	handleMovie = dispatch => ({ data }) => {
		dispatch(pending.unset())

		if (!this._mounted) return false
		dispatch(bIn())
		if (data.status.includes('success')) {
			this.setState({
				data: data.result,
				suggestions: data.suggestions,
				serie: !!data.result.seasons && !!data.result.seasons.length,
				selectedEpisode: this.getFirstAvailable(data.result.seasons)
			})
		} else browserHistory.push('/')
	}

	/*
	*	fetch data from api using id in props.params
	*/
	getData = async (props) => {
		const { dispatch } = this.props

		dispatch(pending.set())
		api.getProfile()
			.then(this.handleProfile(props))
			.then(this.handleMovie(dispatch))
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
			this.setState({ data: null, isMovieRequested: false });
			this.getData(newProps)
		}
	}

	componentWillUnmount() { this._mounted = false }

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

	updateSelected = (selected) => this.setState({
		selectedEpisode: selected,
		isMovieRequested: false,
	})

	requestMovie = () => {
		const { selectedEpisode, data, isMovieRequested, serie } = this.state;
		const { episode, season } = selectedEpisode;
		const { l } = this.props

		if (isMovieRequested) return false;
		
		let srcTrack = apiConnect
		srcTrack += '/public/subtitles/'
		srcTrack += data.code
		srcTrack += serie ? `S${season}E${episode}` : ''
		srcTrack += lang.lang[l]
		srcTrack += '.vtt'
		
		let src = apiConnect
		src += '/api/stream/'
		src += '?r='
		src += localStorage.getItem('selectedQuality')
		src += serie ? `&s=${season}&e=${episode}` : ''
		
		this.setState({
			src,
			srcTrack,
			label: lang.label[l],
			srcLang: lang.labelSRC[l],
			isMovieRequested: true,
		})
	}

	onCommentsUpdate = (newComments) => {
		if (!newComments || !newComments.length) return false;
		this.setState({ data: {
				...this.state.data,
				comments: newComments,
			}
		})
	}

	render() {
		const {
			data,
			selectedEpisode,
			serie,
			src,
			srcTrack,
			label,
			srcLang,
			isMovieRequested,
			username
		} = this.state
		const { l, mainColor, dispatch } = this.props
		if (!data) return (<div className="comp movie" />)
		return (
			<div className="comp movie">
				<VideoPlayer
					mainColor={mainColor}
					l={l}
					src={src}
					dispatch={dispatch}
					srcTrack={srcTrack}
					label={label}
					srcLang={srcLang}
					requestMovie={this.requestMovie}
					isMovieRequested={isMovieRequested}
				/>
				<FilmData
					data={data}
					serie={serie}
					selectedEpisode={selectedEpisode}
					updateSelected={this.updateSelected}
					l={l}
					dispatch={dispatch}
				/>
				<CommentSection
					comments={data.comments}
					l={l}
					movieID={data._id}
					mainColor={mainColor}
					onCommentsUpdate={this.onCommentsUpdate}
					username={username}
				/>
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
