import React				from 'react'

import noImage				from '../../../public/No-image-found.jpg'

import './miniMovie.sass'

export default class MiniMovie extends React.Component {
	render() {
		const { data } = this.props
		return (
			<div
				className="miniMovie"
				style={{
					backgroundImage: `url('${data.poster || noImage}')`, backgroundRepeat: !data.poster ? 'no-repeat' : 'repeat',
				}}>
				<div className="miniInfo">
					<h3>{data.title} ({data.year})</h3>
					<div>
						<i className="material-icons">stars</i>
						<h4>{data.rating}</h4>
					</div>
				</div>
			</div>
		)
	}
}
