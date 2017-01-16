import React			from 'react'
import lang				from '../../lang'
import api				from '../../apiCall'

import TextField	from 'material-ui/TextField'
import FlatButton	from 'material-ui/FlatButton'

class AddComment extends React.Component {
	state = {
		value: '',
	}

	updateTextField = (e) => {
		this.setState({ value: e.target.value })
	}
	
	sendComment = () => {
		if (!this.state.value) return false
		api.addComment({ comment: this.state.value, id: this.props.movieID })
			.then(({ data }) => {
				if (data.status && data.status.includes('success')) {
					this.props.onCommentsUpdate(data.comments)
					this.setState({ value: '' })
				}
			})
		return true
	}
	
	checkSubmit = (e) => {
		if (e.keyCode === 13) {
			this.sendComment()
			e.preventDefault()
		}
	}
	
	getFieldProps = () => {
		const { mainColor } = this.props
		return {
			className: 'textInp',
			autoComplete: 'off',
			floatingLabelFocusStyle: { color: mainColor },
			underlineFocusStyle: { borderColor: mainColor },
		}
	}
	
	render() {
		const { l } = this.props
		const { value } = this.state
		return (
			<form className="commentForm" onSubmit={(e) => e.preventDefault()}>
				<TextField
      		floatingLabelText={lang.commentThisVideo[l]}
      		multiLine={true}
      		rows={1}
      		rowsMax={100}
					fullWidth={true}
					value={value}
					onChange={this.updateTextField}
					onKeyDown={this.checkSubmit}
					{...this.getFieldProps()}
    		/>
				<FlatButton label={lang.save[l]} onTouchTap={this.sendComment}/>
			</form>
		)
	}
}

export default AddComment