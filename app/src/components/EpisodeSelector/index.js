import React				from 'react'

import MenuItem				from 'material-ui/MenuItem'
import DropDownMenu			from 'material-ui/DropDownMenu'

export default ({ selectedEpisode, episodesList, onEpisodeSelect }) => {
	const getSelectedSeason = (newSeason) => episodesList.filter((season) =>
		season.season === newSeason
	)

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
					primaryText={`episode ${ep.episode}`}
					value={ep.episode}
				/>
			)
		} else return false
	}

	const drawSeason = (selectedEpisode, episodesList) => episodesList.map((season) =>
		<MenuItem
			key={season.season}
			primaryText={`season ${season.season}`}
			value={season.season}
			insetChildren={true}
		/>
	)

	return (
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
	)
}
