import axios			from 'axios'
import apiConnect		from '../apiConnect'

const search = async (data) =>
	await axios.get(`${apiConnect}/api/movie/search`, data)

const fastSearch = async (data) =>
	await axios.get(`${apiConnect}/api/movie/fast_search`, data)

const topSearch = async () =>
	await axios.get(`${apiConnect}/api/movie/top_search`)

module.exports = {
	search,
	fastSearch,
	topSearch,
}
