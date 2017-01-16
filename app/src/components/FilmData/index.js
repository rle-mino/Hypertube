import React							from 'react'
import _									from 'lodash'
import { browserHistory }	from 'react-router'
import noImage						from '../../../public/No-image-found.jpg'
import lang								from '../../lang'
import { bOut }						from '../../action/body'

import EpisodeSelector		from '../EpisodeSelector'
import Chip								from 'material-ui/Chip'

const chipStyle = {
	backgroundColor: '#D0D0D0',
}

const FilmData = ({ data, serie, selectedEpisode, updateSelected, l, dispatch }) => {
	
	/*
	*	These methods gets the next or prev episode
	*	using the episodes list and the actual selected episode
	*/
	const next = (i, j) => {
		const episodesList = data.seasons
		if (episodesList[i].episodes[j + 1]) {
			updateSelected({
				season: episodesList[i].episodes[j + 1].season,
				episode: episodesList[i].episodes[j + 1].episode,
			})
		} else if (episodesList[i + 1] && episodesList[i + 1].episodes[0]) {
			updateSelected({
				season: episodesList[i + 1].episodes[0].season,
				episode: episodesList[i + 1].episodes[0].episode,
			})
		}
	}

	const prev = (i, j) => {
		const episodesList = data.seasons
		if (j - 1 > -1) {
			updateSelected({
				season: episodesList[i].episodes[j - 1].season,
				episode: episodesList[i].episodes[j - 1].episode,
			})
		} else if (i - 1 > -1) {
			const {
				episode,
				season
			} = episodesList[i - 1].episodes[episodesList[i - 1].episodes.length - 1]
			updateSelected({ episode, season })
		}
		return false
	}

	/*
	*	iterates through all the episodes and call cb when we reach
	*	the actual selected episode
	*/
	const eachEp = (cb) => {
		const episodesList = data.seasons
		const { episode: sEp, season: sSeas } = selectedEpisode
		episodesList.forEach((season, i) =>
			season.episodes.forEach((episode, j) => {
				if (episode.episode === sEp && episode.season === sSeas) {
					cb(i, j)
				}
			}
		))
	}
	
	const searchCat = (cat) => {
		dispatch(bOut())
		setTimeout(() => browserHistory.push(`/ht/search?category=${cat}`), 500)
	}

	const drawGenre = () => data.genres.map((el, key) => {
		const translation = _.find(lang.categories, (cat) => cat[0] === el)
		return (
			<li key={key}>
				<Chip
					className="chip"
					onTouchTap={() => searchCat(el)}
					style={chipStyle}
				>
					{translation ? translation[l] : el}
				</Chip>
			</li>
		)
	})

	const drawActors = () => data.actors.map((actor, id) =>
		<Chip style={chipStyle} key={id} className="chip">{actor}</Chip>
	)

	return (
		<div className="filmData">
			<div
				className="poster"
				style={{ backgroundImage: `url('${data.poster}'), url('${noImage}')` }}
			/>
			<div className="afterPoster">
				{serie &&
					<EpisodeSelector
						selectedEpisode={selectedEpisode}
						episodesList={data.seasons}
						onEpisodeSelect={updateSelected}
						onClickNext={() => eachEp(next)}
						onClickPrev={() => eachEp(prev)}
						l={l}
					/>
				}
				<h1>{data.title}</h1>
				<div className="rate">
					<i className="material-icons">stars</i>
					<h4>{data.rating}</h4>
				</div>
				<div className="director">
					<p>{lang.director[l]}:</p>
					<Chip style={chipStyle} className="chip">{data.director}</Chip>
				</div>
				<div className="actorsContainer">
					<p>{lang.actors[l]}:</p>
					<ul className="actors">{drawActors()}</ul>
				</div>
				<h3>{lang.year[l]} {data.year}</h3>
				<p className="plot">{data.plot}</p>
				<ul className="genres">
					{drawGenre(data, searchCat, l)}
				</ul>
			</div>
		</div>
	)
}
	
export default FilmData