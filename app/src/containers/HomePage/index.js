import React				from 'react'
import { connect }			from 'react-redux'
import { browserHistory }	from 'react-router'
import api					from '../../apiCall'
import lang					from '../../lang'
import * as bodyDis			from '../../action/body'

import CircularProgress		from 'material-ui/CircularProgress'
import Carousel				from '../../components/Carousel'
import MiniMovie			from '../../components/MiniMovie'

import './sass/homePage.sass'

class HomePage extends React.Component {
	_mounted = false

	state = {
		error: false,
		pending: true,
		dataCar: [],
		dataAft: [],
	}

	componentDidMount = async () => {
		this._mounted = true
		const { data } = await api.topSearch()
		if (!this._mounted) return false
		if (!data.status) return false
		if (data.status === 'error') {
			this.setState({ error: true, pending: false })
		} else {
			this.setState({
				dataCar: data.results.slice(0, 10),
				dataAft: data.results.slice(10, 20),
				pending: false
			})
		}
	}

	componentWillUnmount() {
		this._mounted = false
	}

	goMoviePage = (id) => {
		const { dispatch } = this.props
		dispatch(bodyDis.bOut())
		setTimeout(() => {
			browserHistory.push(`/ht/movie/${id}`)
			dispatch(bodyDis.bIn())
		}, 500)
	}

	drawTopSearch = () => this.state.dataAft.map((el) =>
		<MiniMovie key={el.id} data={el} click={() => this.goMoviePage(el.id)} />
	)

	render() {
		const { l, dispatch, mainColor } = this.props
		const { error, pending, dataCar } = this.state
		return (
			<div className="comp">
				{error &&
					<span className="serverError">{lang.error[l]}</span>}
				{!error && !pending &&
					<div>
						<div className="slider">
							<Carousel data={dataCar} dispatch={dispatch} />
						</div>
						<ul className="topSearchList">
							{this.drawTopSearch()}
						</ul>
					</div>
				}
				{pending && <CircularProgress color={mainColor} style={{ left: '50%' }} />}
			</div>
		)
	}
}

const mapStateToProps = ({ theme, lang }) => ({
	mainColor: theme.mainColor,
	l: lang.l,
})

export default connect(mapStateToProps)(HomePage)
