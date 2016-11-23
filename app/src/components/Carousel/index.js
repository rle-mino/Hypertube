import React			from 'react'
import noImage			from '../../../public/No-image-found.jpg'

import './sass/carousel.sass'

export default class Carousel extends React.Component {
	state = {
		data: [],
		highlight: null,
	}

	drawIMGList = () => this.props.data.map((el, key) =>
			<div
				className="imgInCarousel"
				style={{ backgroundImage: `url('${el.poster}'), url('${noImage}')` }}
				key={key}
			/>
	)

	render() {
		return (
			<div className="carousel" >
				{this.drawIMGList()}
			</div>
		)
	}
}
