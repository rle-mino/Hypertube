import React			from 'react'
import { connect }		from 'react-redux'
import lang				from '../lang'

import InputRange		from 'react-input-range'
import MenuItem			from 'material-ui/MenuItem'
import DropDownMenu		from 'material-ui/DropDownMenu'

import './sass/searchFormDetailed.sass'
import './sass/inputRange.sass'

const category = [
	'Action',
	'Comedy',
	'Drama',
	'Romance',
	'Thriller',
	'Crime',
	'Horror',
	'Sci-Fi',
	'Fantasy',
	'Adventure',
	'Animation',
	'Family',
	'Biography',
	'History',
	'Western',
	'Mystery',
	'Documentary',
	'Music',
	'Sport',
	'War'
]

class SearchFormDetailed extends React.Component {
	_mounted = false

	state = {
		yearValue: {
			min: 1900,
			max: 2016,
		},
		rateValue: {
			min: 0,
			max: 10,
		},
		catVal: 0,
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	updateYear = (e, values) => this.setState({ yearValue: values })
	updateRate = (e, values) => this.setState({ rateValue: values })
	updateCat = (e, index, value) => this.setState({ catVal: value })

	generateCatList = () => category.map((el, key) => <MenuItem value={key} key={key} primaryText={el} />)
	render() {
		const { rateValue, yearValue, catVal } = this.state
		const { l } = this.props
		return (
			<form className="searchFormDetailed">
				<div className="selector">
					<span>{lang.year[l]}</span>
					<InputRange
						maxValue={2016}
						minValue={1900}
						value={yearValue}
						onChange={this.updateYear.bind(this)}
					/>
				</div>
				<DropDownMenu
					value={catVal}
					onChange={this.updateCat}
					style={{ width: '80%' }}
					labelStyle={{ color: 'white' }}
				>
					{this.generateCatList()}
				</DropDownMenu>
				<div className="selector">
					<span>{lang.rating[l]}</span>
					<InputRange
						maxValue={10}
						minValue={0}
						value={rateValue}
						onChange={this.updateRate.bind(this)}
					/>
				</div>
			</form>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(SearchFormDetailed)
