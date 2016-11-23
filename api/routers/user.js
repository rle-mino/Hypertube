import passport				from 'passport';
import expressJwt			from 'express-jwt';
import * as userController	from '../user/controller';
import * as cfg				from '../user/jwt/config';

export default (app) => {
	//app.use(passport.initialize());
	//app.use(expressJwt({
	//	secret: cfg.jwtSecret,
	//}).unless({ path: userController.safePath }));
	//app.use(userController.error);
	//app.use(userController.checkTokenMid);

	require('../user/passport')(passport);
	const userFonc = require('../user/functions')(app, passport);

	app.get('/api/user', (req, res) => {
		res.send('USER ROUTER: OK');
	});


	app.post('/api/user/regi', userFonc.register);

	app.put('/api/user/login', userFonc.login);

	app.get('/api/user/auth/42', passport.authenticate('42'));


	app.get('/api/user/auth/42/callback', (req, res, next) => {
		passport.authenticate('42', (err, user) => {
			if (err) return res.send(err);
			if (!user) {
				return res.send({ status: false, details: 'error occured' });
			}
			return res.send(user);
		})(req, res, next);
	});
};
