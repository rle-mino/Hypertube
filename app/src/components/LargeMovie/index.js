import React			from 'react'

import { ListItem }		from 'material-ui/List'

import './largeMovie.sass'

export default ({ data, click }) => {
	return (
		<ListItem
			className="largeMovie"
			style={{}}
			innerDivStyle={{ padding: '3px 0px', margin: '0' }}
			onTouchTap={click}
		>
			<div
				className="thumbMovie"
				style={{ backgroundImage: `url('${data.poster}')` }}
			/>
			<h3>{data.title}</h3>
			<p>{data.year || 'unknown'}</p>
			<p>{data.rating ? `${data.rating} / 10` : 'unknown'}</p>
		</ListItem>
	)
}
