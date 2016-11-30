import React                from 'react'

import noImage                from '../../../public/No-image-found.jpg'

import './miniMovie.sass'

export default class MiniMovie extends React.Component {
    render() {
        const { data, click } = this.props
        return (
            <div
                className="miniMovie"
                onClick={click}
                style={{ backgroundImage: `url('${data.poster}'), url('${noImage}')` }}>
                <div className={`miniInfo ${!data.poster ? 'noPoster' : '' }`}>
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
