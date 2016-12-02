import React				from 'react'

import MenuItem				from 'material-ui/MenuItem'
import ArrowDropRight		from 'material-ui/svg-icons/navigation-arrow-drop-right'
import DropDownMenu			from 'material-ui/DropDownMenu'

export default ({ selectedEpisode, episodesList, onEpisodeSelect }) => {
	const updateSelected = (e, index, value) => {
		console.log(e, index, value)
	}

	const drawEpisode = (season) => season.episodes.map((ep) =>
		<MenuItem
			key={ep.episode}
			primaryText={`episode ${ep.episode}`}
			value={ep.episode}
		/>
	)

	const drawSeason = (selectedEpisode, episodesList) => episodesList.map((season) =>
		<MenuItem
			key={season.season}
			primaryText={`season ${season.season}`}
			value={season.season}
			rightIcon={<ArrowDropRight />}
			insetChildren={true}
			menuItems={drawEpisode(season)}
		/>
	)
	console.log(selectedEpisode)
	return (
		<DropDownMenu
			value={selectedEpisode.season}
			onChange={updateSelected}
			autoWidth={false}
			style={{ width: '300px' }}
		>
			{drawSeason(selectedEpisode, episodesList)}
		</DropDownMenu>
	)
}
