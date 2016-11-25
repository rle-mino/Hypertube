import passport				from 'passport';
import expressJwt			from 'express-jwt';
import jwt 			from 'jsonwebtoken';
import session				from 'express-session';
import * as userController	from '../user/controller';
import * as cfg				from '../user/jwt/config';
import passportStrat		from '../user/passport';
import ctrlGen				from '../user/functions';

export default (app) => {
	app.use(passport.initialize());
	app.use(expressJwt({
		secret: cfg.jwtSecret,
	}).unless({ path: userController.safePath }));
	app.use(userController.error);
	app.use(session({
		secret: 'ssshhhhh',
		resave: false,
		saveUninitialized: false,
	}));
	app.use(userController.checkTokenMid);

	passportStrat(passport);
	const userFonc = ctrlGen(app, passport);

	app.get('/api/user', (req, res) => {
		res.send('USER ROUTER: OK');
	});

	app.get('/api/user/get_picture', userController.getPicture);

	app.post('/api/user/register', userFonc.register);

	app.put('/api/user/login', userFonc.login);

	app.get('/api/user/auth/42', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('42'));

	app.get('/api/user/auth/42/callback', userFonc.schoolLogin);


	app.get('/api/user/auth/facebook', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('facebook'));

	app.get('/api/user/auth/facebook/callback', userFonc.facebookLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

	app.get('/api/user/auth/twitter', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('twitter'));

	app.get('/api/user/auth/twitter/callback', userFonc.twitterLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		console.log(req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

	app.get('/api/user/auth/github', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('github'));

	app.get('/api/user/auth/github/callback', userFonc.githubLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

};
