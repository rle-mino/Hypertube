import React				from 'react'
import { browserHistory }	from 'react-router'
import * as bodyDis			from '../../action/body'

import noImage				from '../../../public/No-image-found.jpg'

import './sass/carousel.sass'

export default class Carousel extends React.Component {
	state = {
		highlight: null,
		mt: 0,
	}

	goMoviePage = (id) => {
		const { dispatch } = this.props
		dispatch(bodyDis.bOut())
		setTimeout(() => {
			browserHistory.push(`/ht/movie/${id}`)
			dispatch(bodyDis.bIn())
		}, 500)
	}

	drawIMGList = () => this.props.data.map((el, key) =>
			<div className="IMGBlock" key={key} onClick={() => this.goMoviePage(el.id)}>
				<div
					className="blurredIMG"
					style={{ backgroundImage: `url('${el.poster}'), url('${noImage}')` }}
				/>
				<div
					className="frontIMG"
					style={{ backgroundImage: `url('${el.poster}'), url('${noImage}')` }}
				/>
			</div>
	)

	componentDidMount = () => {
		this.interval = setInterval(() => {
			const mt = (this.state.mt + 300) % (this.props.data.length * 300)
			this.setState({ mt })
		}, 4000)
	}

	componentWillUnmount() {
		clearInterval(this.interval)
	}

	render() {
		const { mt } = this.state
		return (
			<div className="carousel" style={{ marginTop: `-${mt}px` }}>
				{this.drawIMGList()}
			</div>
		)
	}
}
