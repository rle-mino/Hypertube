import React				from 'react'
import lang					from '../../lang'
import { goMoviePage }		from '../../action/body'

import MiniMovie			from '../MiniMovie'

const drawHistory = (history, dispatch) => history.map((el) =>
	<MiniMovie key={el.id} data={el} click={() => goMoviePage(el.id, dispatch)} />
)

export default ({ history, l, dispatch }) =>
	<div className="history">
		<h3>{lang.yourHistory[l]}</h3>
		{(history && history.length &&
			<ul className="historyList">{drawHistory(history, dispatch)}</ul>) ||
			<div className="empty">{lang.empty[l]}</div>
		}
	</div>
