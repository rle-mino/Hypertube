import React				from 'react'
import lang					from '../../lang'
import api					from '../../apiCall'

import IconClickable		from '../IconClickable'

const Comment = ({ comment, username, l, movieID, onCommentsUpdate }) => {
	const handleRemove = ({ data }) => {
		console.log(data.comments);
		if (data.status && data.status.includes('success')) {
			onCommentsUpdate(data.comments)
		}
	}
	
	const removeComment = () => {
		api.removeComment({ id: movieID, commentId: comment.id })
			.then(handleRemove)
	}

	return (
		<li className="comment">
			<p>{comment.authorName}</p>
			<p className="commentText">{comment.text}</p>
			{username === comment.authorName &&
				<IconClickable
					className="removeComment"
					tooltip={lang.remove[l]}
					click={removeComment}
				>
					<i className="material-icons">remove_circle</i>
				</IconClickable>
			}
		</li>
	)
}

export default Comment