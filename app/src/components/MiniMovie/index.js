import React				from 'react'

import './miniMovie.sass'

export default ({ data }) =>
	<div className="miniMovie" style={{ backgroundImage: `url('${data.poster}')` }}>

	</div>
