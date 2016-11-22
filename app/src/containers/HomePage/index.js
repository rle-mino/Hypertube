import React				from 'react'
import { connect }			from 'react-redux'
import api					from '../../apiCall'
import lang					from '../../lang'

import CircularProgress		from 'material-ui/CircularProgress'
import Carousel				from '../../components/Carousel'

class HomePage extends React.Component {
	state = {
		error: false,
		pending: true,
		dataCar: [],
		dataAft: [],
	}

	componentDidMount = async () => {
		const { data } = await api.topSearch()
		if (!data.status) return (false)
		if (data.status === false) {
			this.setState({ error: true, pending: false })
		} else {
			this.setState({
				dataCar: data.results.slice(0, 10),
				dataAft: data.results.slice(10, 20),
				pending: false
			})
		}
	}

	render() {
		const { l/*, dispatch*/, mainColor } = this.props
		const { error, pending, dataCar } = this.state
		return (
			<div className="comp">
				{error &&
					<span className="serverError">{lang.error[l]}</span>}
				{!error && !pending &&
					<div className="slider">
						<Carousel data={dataCar} />
					</div>
				}
				{pending &&
					<CircularProgress color={mainColor} />
				}
			</div>
		)
	}
}

const mapStateToProps = ({ theme, lang }) => ({
	mainColor: theme.mainColor,
	l: lang.l,
})

export default connect(mapStateToProps)(HomePage)
