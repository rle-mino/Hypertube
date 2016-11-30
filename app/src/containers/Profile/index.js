import React			from 'react'
import { connect }		from 'react-redux'
// import lang				from '../../lang'
import api				from '../../apiCall'

import CircularProgress	from 'material-ui/CircularProgress'
import EditImage		from '../../components/EditImage'
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
		const { mainColor, l } = this.props
		return (
			<div className="comp profile">
			{!data &&
				<CircularProgress color={mainColor} style={{ left: '50%' }}/>
			}
			{data &&
				<div className="userData">
					<div
						className="image"
						style={{ backgroundImage: `url('${data.image}'), url('${noImage}')` }}
					>
						<EditImage l={l} onUpdate={this.updateData} mainColor={mainColor} />
					</div>
					<div className="userCred">
						<h3>{data.username}</h3>
						<h3>{data.firstname} {data.lastname}</h3>
						<h3>{data.mail}</h3>
						{data && data.provider.includes('local') &&
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
			</div>
		)
	}
}

const mapStateToProps = ({ lang, theme }) => ({
	l: lang.l,
	mainColor: theme.mainColor,
})

export default connect(mapStateToProps)(Profile)
