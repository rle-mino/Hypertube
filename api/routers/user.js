export default (app) => {
	app.get('/api/user', (req, res) => {
		res.send('USER ROUTER: OK');
	});
};