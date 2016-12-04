import React			from 'react'
import { connect }		from 'react-redux'
import api				from '../../apiCall'

import CircularProgress	from 'material-ui/CircularProgress'
import EditPassword		from '../../components/EditPassword'
import EditImage		from '../../components/EditImage'
import History			from '../../components/History'
import EditComp			from '../../components/EditComp'
import noImage			from '../../../public/No-image-found.jpg'

import './sass/profile.sass'

class Profile extends React.Component {
	_mounted = false

	state = {
		data: null,
	}

	componentDidMount = async () => {
		this._mounted = true
		const { data } = await api.getProfile()
		if (!this._mounted) return false
		this.setState({ data: data.profile })
	}

	componentWillUnmount() {
		this._mounted = false
	}

	updateData = async () => {
		const { data } = await api.getProfile()
		if (!this._mounted) return false
		this.setState({ data: data.profile })
	}

	render() {
		const { data } = this.state
		const { mainColor, l, dispatch } = this.props
		const editable = data && data.provider.includes('local')
		return (
			<div className="comp profile">
			{!data &&
				<CircularProgress color={mainColor} style={{ left: '50%' }}/>
			}
			{data &&
				<div className="userData">
					{editable && <EditPassword mainColor={mainColor} l={l} />}
					<div
						className="image"
						style={{ backgroundImage: `url('${data.image}'), url('${noImage}')` }}
					>
						{editable && <EditImage l={l} onUpdate={this.updateData} mainColor={mainColor} />}
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
							/>
						}
					</div>
				</div>
			}
			{data && <History history={data.history} l={l} dispatch={dispatch}/>}
			</div>
		)
	}
}

const mapStateToProps = ({ lang, theme }) => ({
	l: lang.l,
	mainColor: theme.mainColor,
})

export default connect(mapStateToProps)(Profile)
