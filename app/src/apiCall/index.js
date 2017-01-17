import axios			from 'axios'
import apiConnect		from '../apiConnect'
import lang				from '../lang'

const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('logToken')}` } })

const login = (data) =>
 axios({
		url: `${apiConnect}/api/user/login`,
		method: 'put',
		data,
	})

const register = (data) =>
 axios({
		url: `${apiConnect}/api/user/register`,
		method: 'post',
		data,
	})

const upPhoto = (data) =>
 axios({
		url: `${apiConnect}/api/user/upload_pic`,
		method: 'post',
		data,
		headers: {
			'Content-Type': 'multipart/form-data',
			...getToken().headers,
		}
	})

const search = (data) =>
 axios.get(`${apiConnect}/api/movie/search`,
		{ ...data, ...getToken() }
	)

const fastSearch = (data) =>
 axios.get(`${apiConnect}/api/movie/fast_search`,
		{ ...data, ...getToken() }
	)

const topSearch = () =>
 axios.get(
		`${apiConnect}/api/movie/top_search`,
		getToken()
	)

const getPict = () =>
 axios.get(`${apiConnect}/api/user/get_picture`, getToken())

const getMovie = (id, l) =>
 axios.get(`${apiConnect}/api/movie/${id}?lg=${lang.lang[l]}`, getToken())

const getProfile = () =>
 axios.get(`${apiConnect}/api/user/profile`, getToken())

const updateProfile = (data) =>
 axios({
		url: `${apiConnect}/api/user/edit`,
		method: 'put',
		data,
		...getToken(),
	})

const forgotPass = (data) =>
 axios({
		url: `${apiConnect}/api/user/forgot`,
		method: 'put',
		data,
	})

const resetPass = (data) =>
 axios({
		url: `${apiConnect}/api/user/reset`,
		method: 'put',
		data,
	})

const updatePass = (data) =>
 axios({
		url: `${apiConnect}/api/user/change_pass`,
		method: 'put',
		data,
		...getToken(),
	})

const getStream = (id, serieInfo) => {
	const { e, s } = serieInfo || {};
	if (!serieInfo) {
		return axios.get(`${apiConnect}/api/stream/${id}`, getToken())
	}
	return axios.get(`${apiConnect}/api/stream/${id}?s=${s}&e=${e}`, getToken())

}

const checkAuth = () => axios.get(`${apiConnect}/api/user/check_auth`, getToken())

const addComment = (data) => axios({
	url: `${apiConnect}/api/movie/addcomment`,
	method: 'post',
	data,
	...getToken(),
})

const removeComment = (data) => axios({
	url: `${apiConnect}/api/movie/deletecomment`,
	method: 'delete',
	data,
	...getToken(),
})

const addHistory = (data) => axios({
	url: `${apiConnect}/api/movie/history`,
	method: 'put',
	data,
	...getToken(),
});

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
	addComment,
	removeComment,
	addHistory,
}
