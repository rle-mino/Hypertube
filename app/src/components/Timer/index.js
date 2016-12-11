import React			from 'react'

export default ({ currentTime, duration, mainColor }) =>
<span style={{ color: mainColor }} className="timer">
	{currentTime} / {duration}
</span>
