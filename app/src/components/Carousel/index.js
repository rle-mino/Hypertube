import React				from 'react'
import { goMoviePage }		from '../../action/body'

import noImage				from '../../../public/No-image-found.jpg'
import IconClickable		from '../../components/IconClickable'
import MiniMovie			from '../../components/MiniMovie'

import './sass/carousel.sass'

const buttonStyle = {
	position: 'absolute',
	backgroundColor: 'white',
	borderRadius: '50%',
	zIndex: '2',
	top: '50%',
	transform: 'translate(-50%, -50%)'
}

export default class Carousel extends React.Component {
	state = {
		mt: 0,
	}

	drawIMGList = () => this.props.data.map((el, key) =>
			<div className="IMGBlock" key={key} onClick={() => goMoviePage(el.id, this.props.dispatch)}>
				<div
					className="blurredIMG"
					style={{ backgroundImage: `url('${el.poster}'), url('${noImage}')` }}
				/>
				<MiniMovie data={el} key={key}/>
			</div>
	)

	playCarousel = () => this.setState({
		mt: (this.state.mt + 100) % (this.props.data.length * 100)
	})

	componentDidMount = () => this.interval = setInterval(this.playCarousel, 4000)

	componentWillUnmount() { clearInterval(this.interval) }

	playStopCarousel = (e) => {
		if (e.type.includes('mouseenter')) {
			clearInterval(this.interval)
		} else if (e.type.includes('mouseleave')) {
			clearInterval(this.interval)
			this.interval = setInterval(this.playCarousel, 4000)
		}
	}

	goPrev = () => {
		const { mt } = this.state
		if (mt === 0) {
			this.setState({ mt: (this.props.data.length - 1) * 100 })
		} else this.setState({ mt: (this.state.mt - 100) })
	}

	goNext = () => this.setState({ mt: (this.state.mt + 100) % (this.props.data.length * 100) })

	render() {
		const { mt } = this.state
		const { mainColor } = this.props
		return (
			<div className="carouselContainer"
				onMouseEnter={this.playStopCarousel}
				onMouseLeave={this.playStopCarousel}
			>
				<IconClickable
					className="arrows"
					style={{ ...buttonStyle, left: '5%', color: mainColor }}
					click={this.goPrev}
				>
					<i className="material-icons">keyboard_arrow_left</i>
				</IconClickable>
				<div
					className="carousel"
					style={{ marginLeft: `-${mt}%` }}
				>
					{this.drawIMGList()}
				</div>
				<IconClickable
					className="arrows"
					style={{ ...buttonStyle, left: '95%', color: mainColor }}
					click={this.goNext}
				>
					<i className="material-icons">keyboard_arrow_right</i>
				</IconClickable>
			</div>
		)
	}
}
