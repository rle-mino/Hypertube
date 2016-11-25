import axios			from 'axios'
import apiConnect		from '../apiConnect'

const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('logToken')}` } })

const login = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/login`,
		method: 'put',
		data,
	})

const search = async (data) =>
	await axios.get(`${apiConnect}/api/movie/search`,
		{...data, ...getToken()}
	)

const fastSearch = async (data) =>
	await axios.get(`${apiConnect}/api/movie/fast_search`,
		{...data, ...getToken()}
	)

const topSearch = async () =>
	await axios.get(
		`${apiConnect}/api/movie/top_search`,
		getToken()
	)

const getPict = async () =>
	await axios.get(
		`${apiConnect}/api/user/get_picture`,
		getToken()
	)

module.exports = {
	search,
	fastSearch,
	topSearch,
	getPict,
	login,
}
