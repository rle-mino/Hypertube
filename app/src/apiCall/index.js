import axios			from 'axios'
import apiConnect		from '../apiConnect'

const search = async (data) =>
	await axios.get(`${apiConnect}/api/movie/search`, data)

const fastSearch = async (data) =>
	await axios.get(`${apiConnect}/api/movie/fast_search`, data)

module.exports = {
	search,
	fastSearch,
}
