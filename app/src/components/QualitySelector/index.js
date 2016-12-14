import React			from 'react'

import DropDownMenu		from 'material-ui/DropDownMenu'
import MenuItem			from 'material-ui/MenuItem'

const resolutions = [
	'8k',
    '4k',
	'2160p',
    '1440p',
    '1080p',
    '720p',
    '420p',
]

export default class QualitySelector extends React.Component {
	state = {
		quality: localStorage.getItem('selectedQuality') || '1080p',
	}

	componentWillMount() {
		const quality = localStorage.getItem('selectedQuality')
		if (!quality) {
			localStorage.setItem('selectedQuality', '1080p')
		}
	}

	drawResolutions = () => resolutions.map((resolution, key) =>
		<MenuItem
			key={key}
			primaryText={resolution}
			value={key}
		/>
	)

	update = (e, index, value) => {
		this.setState({ quality: resolutions[value] })
		localStorage.setItem('selectedQuality', resolutions[value])
	}

	render() {
		const { quality } = this.state
		return (
			<div className="resolutionSelector">
				<DropDownMenu
					value={resolutions.indexOf(quality)}
					onChange={this.update}
				>
					{this.drawResolutions()}
				</DropDownMenu>
			</div>
		)
	}
}
