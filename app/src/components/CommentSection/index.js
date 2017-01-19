import React						from 'react'

import AddComment				from './AddComment'
import Comment					from './Comment'
import './sass/commentSection.sass'

const CommentSection = ({ l, movieID, comments, mainColor, onCommentsUpdate, username }) => {
	const drawComments = () => comments.map(comment =>
		<Comment
			key={comment.id}
			comment={comment}
			username={username}
			l={l}
			movieID={movieID}
			onCommentsUpdate={onCommentsUpdate}
		/>
	);

	return (
		<div className="commentContainer">
			<AddComment l={l} movieID={movieID} mainColor={mainColor} onCommentsUpdate={onCommentsUpdate}/>
			<ul className="commentList">
				{drawComments()}
			</ul>
		</div>
	)
}

export default CommentSection
