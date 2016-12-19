import React						from 'react'
import { connect }			from 'react-redux'
import browserHistory		from 'react-router/lib/browserHistory'
import lang							from '../../lang'
import api							from '../../apiCall'
import * as pending			from '../../action/pending'

import CircularProgress	from 'material-ui/CircularProgress'
import Snackbar					from 'material-ui/Snackbar'
import EditPassword			from '../../components/EditPassword'
import QualitySelector	from '../../components/QualitySelector'
import EditImage				from '../../components/EditImage'
import History					from '../../components/History'
import EditComp					from '../../components/EditComp'
import noImage					from '../../../public/No-image-found.jpg'

import './sass/profile.sass'

class Profile extends React.Component {
	_mounted = false

	state = {
		data: null,
		updated: false,
		updatedPass: false
	}

	/*
	*		get profile from api and redirect the user to login
	*		if an error occurred
	*/
	componentDidMount = async () => {
		this._mounted = true

		this.props.dispatch(pending.set())
		const { data } = await api.getProfile()
		this.props.dispatch(pending.unset())

		if (!this._mounted) return false
		if (data.status && data.status.includes('error')) {
			browserHistory.push('/')
		}
		this.setState({ data: data.profile })
	}

	componentWillUnmount() {
		this._mounted = false
	}

	/*
	*		When the user updates his profile
	*		we request the api to get the updated profile
	*/
	updateData = async () => {
		const { data } = await api.getProfile()
		if (!this._mounted) return false
		this.setState({ data: data.profile, updated: true })
	}

	/*
	*		if the password is updated
	*		we do not need to get the updated profile
	*		so we just set the updatedPass to true
	*		to render the Snackbar
	*/
	passUpdated = () => this.setState({ updatedPass: true })

	handleRequestClose = () => this.setState({ updated: false })
	handleRequestClosePass = () => this.setState({ updatedPass: false })

	render() {
		const { data, updated, updatedPass } = this.state
		const { mainColor, l, dispatch } = this.props
		const editable = data && data.provider.includes('local')
		return (
			<div className="comp profile">
			{!data &&
				<CircularProgress color={mainColor} style={{ left: '50%' }}/>
			}
			{data &&
				<div className="userData">
					{editable &&
						<EditPassword
							onUpdate={this.passUpdated}
							mainColor={mainColor}
							dispatch={dispatch}
							l={l}
						/>
					}
					<QualitySelector />
					<div
						className="image"
						style={{ backgroundImage: `url('${data.image}'), url('${noImage}')` }}
					>
						{editable && <EditImage
							l={l}
							onUpdate={this.updateData}
							mainColor={mainColor}
							dispatch={dispatch}
						/>}
					</div>
					<div className={editable ? 'userCred' : 'miniCred'}>
						<h3>{data.username}</h3>
						<h3>{data.firstname} {data.lastname}</h3>
						<h3>{data.mail}</h3>
						{editable &&
							<EditComp
								firstname={data.firstname}
								lastname={data.lastname}
								mail={data.mail}
								onUpdate={this.updateData}
								mainColor={mainColor}
								l={l}
								dispatch={dispatch}
							/>
						}
					</div>
				</div>
			}
			{data && <History history={data.history} l={l} dispatch={dispatch}/>}
			<Snackbar
				open={updated}
				message={lang.yourProfileHasBeenUpdated[l]}
				autoHideDuration={4000}
				onRequestClose={this.handleRequestClose}
			/>
			<Snackbar
				open={updatedPass}
				message={lang.yourPasswordHasBeenUpdated[l]}
				autoHideDuration={4000}
				onRequestClose={this.handleRequestClosePass}
			/>
			</div>
		)
	}
}

const mapStateToProps = ({ lang, theme }) => ({
	l: lang.l,
	mainColor: theme.mainColor,
})

export default connect(mapStateToProps)(Profile)
