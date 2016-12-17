import React				from 'react'
import lang					from '../../lang'
import api					from '../../apiCall'
import * as pending			from '../../action/pending'

import IconClickable		from '../IconClickable'
import Dialog				from 'material-ui/Dialog'
import FlatButton			from 'material-ui/FlatButton'

/*
*	add pause and unpause method to mousetrap
*/
import msPause			from 'mousetrap-pause'
import ms				from 'mousetrap'

const MouseTrap = msPause(ms)

const imageInput = {
	cursor: 'pointer',
	position: 'absolute',
	top: 0,
	bottom: 0,
	right: 0,
	left: 0,
	width: '100%',
	opacity: 0,
}

export default class EditImage extends React.Component {
	_mounted = false

	state = {
		open: false,
		inputLabel: '',
		image: null,
	}

	componentDidMount() {
		this._mounted = true
		this.setState({ inputLabel: lang.chooseAnImage[this.props.l] })
	}

	componentWillUnmount() {
		this._mounted = false
		MouseTrap.unpause()
	}

	handleOpen = () => {
		this.setState({ open: true });
		MouseTrap.pause()
	}

	handleClose = () => {
		this.setState({ open: false });
		MouseTrap.unpause()
	}

	handleChange = (e) => {
		const file = e.target.files[0]
		if (!file) return false
		const img = new Image()
		img.onload = () => this.setState({ image: file, imageR: null, inputLabel: file.name })
		img.onerror = () => this.setState({
			inputLabel: lang.invalidImage[this.props.l],
			image: null,
		})
		const _URL = window.URL || window.webkitURL
		img.src = _URL.createObjectURL(e.target.files[0])
	}

	uploadImage = async () => {
		if (!this.state.image) {
			this.props.onUpdate()
			this.setState({ open: false })
			return false
		}

		const image = new FormData()
		image.append('image', this.state.image)

		this.props.dispatch(pending.set())
		const { data } = await api.upPhoto(image)
		this.props.dispatch(pending.unset())

		if (data.status && data.status.includes('success')) {
			this.props.onUpdate()
			this.setState({ open: false })
		} else this.setState({ inputLabel: lang.error[this.props.l] })
	}

	render() {
		const { open, inputLabel } = this.state
		const { l, mainColor } = this.props
		return (
			<div>
				<IconClickable
					click={this.handleOpen}
					className="updateIMGButton"
					style={{ color: mainColor }}
				>
					<i className="material-icons">mode_edit</i>
				</IconClickable>
				<Dialog
					title={lang.changeYourImage[l]}
					modal={false}
					open={open}
					onRequestClose={this.handleClose}
					contentStyle={{ width: '100%' }}
					actions={[
						<FlatButton
							label={lang.cancel[l]}
							primary={true}
							onTouchTap={this.handleClose}
							labelStyle={{ color: mainColor }}
						/>,
						<FlatButton
			  				label={lang.save[l]}
							primary={true}
							style={{ color: mainColor }}
							onTouchTap={this.uploadImage}
							labelStyle={{ color: mainColor }}
						/>,
					]}
				>
					<FlatButton
						label={inputLabel}
						labelPosition="before"
					>
				    	<input
							type="file"
							name="image"
							style={imageInput}
							onChange={this.handleChange}
						/>
				    </FlatButton>
				</Dialog>
			</div>
		)
	}
}
