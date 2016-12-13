import React				from 'react'
import lang					from '../../lang'

import MenuItem				from 'material-ui/MenuItem'
import FlatButton			from 'material-ui/FlatButton'
import DropDownMenu			from 'material-ui/DropDownMenu'

export default ({ selectedEpisode, episodesList, onEpisodeSelect, l, onClickPrev, onClickNext }) => {

	const getSelectedSeason = (newSeason) =>
		episodesList.filter((season) => season.season === newSeason)

	const getFirstAvailable = (newSeason) => {
		const selectedSeason = getSelectedSeason(newSeason)
		if (selectedSeason && selectedSeason.length) {
			return (selectedSeason[0].episodes[0].episode)
		} else return false
	}

	const updateSeason = (e, index, value) => onEpisodeSelect({
		season: value,
		episode: getFirstAvailable(value),
	})

	const updateEpisode = (e, index, value) => onEpisodeSelect({
		season: selectedEpisode.season,
		episode: value,
	})

	const drawEpisode = (seasons) => {
		const selectedSeason = getSelectedSeason(selectedEpisode.season)
		if (selectedSeason && selectedSeason.length) {
			return selectedSeason[0].episodes.map((ep) =>
				<MenuItem
					key={ep.episode}
					primaryText={`${lang.episode[l]} ${ep.episode}`}
					value={ep.episode}
				/>
			)
		} else return false
	}

	const drawSeason = (selectedEpisode, episodesList) => episodesList.map((season) =>
		<MenuItem
			key={season.season}
			primaryText={`${lang.season[l]} ${season.season}`}
			value={season.season}
		/>
	)

	const filterEpisode = (checkEpisode) => {
		const list = episodesList.filter((season) => {
			const episodes = season.episodes.filter(checkEpisode)
			return (episodes && episodes.length)
		})
		return (list && list.length)
	}

	const checkNext = (episode) =>
		episode.season > selectedEpisode.season ||
		(episode.episode > selectedEpisode.episode &&
		episode.season >= selectedEpisode.season)

	const checkPrev = (episode) =>
		(episode.season <= selectedEpisode.season &&
		episode.episode < selectedEpisode.episode) ||
		episode.season < selectedEpisode.season

	const hasNext = filterEpisode(checkNext)
	const hasPrev = filterEpisode(checkPrev)

	const getStyle = (isVisible) => ({
		opacity: isVisible ? 1 : 0,
		cursor: isVisible ? 'pointer' : 'default',
	})

	return (
		<div>
			<div className="prevNext">
				<FlatButton
					label={lang.prev[l]}
					style={getStyle(!!hasPrev)}
					onTouchTap={!!hasPrev ? onClickPrev : () => null}
				/>
				<FlatButton
					label={lang.next[l]}
					style={getStyle(!!hasNext)}
					onTouchTap={!!hasNext ? onClickNext : () => null}
				/>
			</div>
			<div>
				<DropDownMenu
					value={selectedEpisode.season}
					onChange={updateSeason}
					autoWidth={false}
					style={{ width: '150px' }}
				>
					{drawSeason(selectedEpisode, episodesList)}
				</DropDownMenu>
				<DropDownMenu
					value={selectedEpisode.episode}
					onChange={updateEpisode}
					autoWidth={false}
					style={{ width: '150px' }}
				>
					{drawEpisode(episodesList)}
				</DropDownMenu>
			</div>
		</div>
	)
}
