import React				from 'react'
import lang					from '../../lang'

export default ({ author, l }) =>
	<div className="userProfile">
		<div>
			{(author.provider === 'local' &&
				<div className="imgComment" style={{
					backgroundImage: `url('http://localhost:8080/api/user/public/${author.image[0]}')`,
				}} />)
				||
				<div className="imgComment" style={{
					backgroundImage: `url('${author.image[0]}')`,
				}} />
			}
		</div>
		<div>
			<p>{author.mail}</p>
			{author.history[0] &&
				<p>{lang.lastSeen[l]} : {author.history[(author.history.length) - 1].title}</p>
			}
		</div>
	</div>