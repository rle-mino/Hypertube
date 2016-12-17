import browserHistory			from 'react-router/lib/browserHistory'

export const bOut = () => ({
	type: 'BODY_OUT',
})

export const bIn = () => ({
	type: 'BODY_IN'
})

export const goMoviePage = (id, dispatch) => {
	dispatch(bOut())
	setTimeout(() => browserHistory.push(`/ht/movie/${id}`), 500)
}
