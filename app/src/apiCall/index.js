import axios			from 'axios'
import apiConnect		from '../apiConnect'
import lang				from '../lang'

const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('logToken')}` } })

const login = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/login`,
		method: 'put',
		data,
	})

const register = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/register`,
		method: 'post',
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

const getMovie = async (id, l) =>
	await axios.get(`${apiConnect}/api/movie/${id}?lg=${lang.lang[l]}`, getToken())

module.exports = {
	search,
	fastSearch,
	topSearch,
	getPict,
	login,
	register,
	getMovie,
}
