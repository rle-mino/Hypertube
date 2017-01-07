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

const upPhoto = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/upload_pic`,
		method: 'post',
		data,
		headers: {
			'Content-Type': 'multipart/form-data',
			...getToken().headers,
		}
	})

const search = async (data) =>
	await axios.get(`${apiConnect}/api/movie/search`,
		{ ...data, ...getToken() }
	)

const fastSearch = async (data) =>
	await axios.get(`${apiConnect}/api/movie/fast_search`,
		{ ...data, ...getToken() }
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

const getProfile = async () =>
	await axios.get(`${apiConnect}/api/user/profile`, getToken())

const updateProfile = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/edit`,
		method: 'put',
		data,
		...getToken(),
	})

const forgotPass = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/forgot`,
		method: 'put',
		data,
	})

const resetPass = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/reset`,
		method: 'put',
		data,
	})

const updatePass = async (data) =>
	await axios({
		url: `${apiConnect}/api/user/change_pass`,
		method: 'put',
		data,
		...getToken(),
	})

const getStream = async (id, serieInfo) => await axios.get(`${apiConnect}/api/stream/${id}`, getToken())

const checkAuth = async () => await axios.get(`${apiConnect}/api/user/check_auth`, getToken())

module.exports = {
	search,
	fastSearch,
	topSearch,
	getPict,
	login,
	register,
	getMovie,
	upPhoto,
	getProfile,
	updateProfile,
	forgotPass,
	resetPass,
	updatePass,
	checkAuth,
	getStream,
}
