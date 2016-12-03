import passport				from 'passport';
import expressJwt			from 'express-jwt';
import jwt 					from 'jsonwebtoken';
import express				from 'express';
import session				from 'express-session';
import * as userController	from '../user/controller';
import * as cfg				from '../user/jwt/config';
import passportStrat		from '../user/passport';
import ctrlGen				from '../user/functions';

export default (app) => {
	app.use('/api/user/public', express.static('public'));
	app.use(passport.initialize());
	app.use(expressJwt({
		secret: cfg.jwtSecret,
	}).unless({ path: userController.safePath }));
	app.use(userController.errors);
	app.use(session({
		secret: 'ssshhhhh',
		resave: false,
		saveUninitialized: false,
	}));
	app.use(userController.checkTokenMid);

	passportStrat(passport);
	const userFonc = ctrlGen(app, passport);

// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////

	app.get('/api/user', (req, res) => {
		res.send('USER ROUTER: OK');
	});

// /////////////////////////////////////////////////////////////////////////////
// ///////              LOCAL USER ROUTES                                 //////
// /////////////////////////////////////////////////////////////////////////////


	app.put('/api/user/forgot', userController.forgotPassword);

	app.put('/api/user/reset', userController.resetPassword);

	app.get('/api/user/profile', userController.getProfile);

	app.put('/api/user/change_pass', userController.changePassword);

	app.put('/api/user/edit', userController.editProfile);

	app.post('/api/user/upload_pic', userController.uploadPic);

	app.get('/api/user/get_picture', userController.getPicture);

	app.post('/api/user/register', userFonc.register);

	app.put('/api/user/login', userFonc.login);

// /////////////////////////////////////////////////////////////////////////////
// ///////              OAUTH ROUTES       		                          //////
// /////////////////////////////////////////////////////////////////////////////

	app.get('/api/user/auth/42', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('42'));

	app.get('/api/user/auth/42/callback', userFonc.schoolLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

//	////////////////////////////////////////////////////////////////////////////

	app.get('/api/user/auth/facebook', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('facebook'));

	app.get('/api/user/auth/facebook/callback', userFonc.facebookLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

//	////////////////////////////////////////////////////////////////////////////

	app.get('/api/user/auth/twitter', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('twitter'));

	app.get('/api/user/auth/twitter/callback', userFonc.twitterLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

//	////////////////////////////////////////////////////////////////////////////

	app.get('/api/user/auth/github', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('github'));

	app.get('/api/user/auth/github/callback', userFonc.githubLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

//	////////////////////////////////////////////////////////////////////////////

	app.get('/api/user/auth/google', (req, res, next) => {
		req.session.query = req.query;
		next();
	}, passport.authenticate('google', { scope: ['profile', 'email'] }));

	app.get('/api/user/auth/google/callback', userFonc.googleLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

//	////////////////////////////////////////////////////////////////////////////

	app.get('/api/user/auth/linkedin', (req, res, next) => {
		req.session.query = req.query;
		console.log(req.query);

		next();
	}, passport.authenticate('linkedin'));

	app.get('/api/user/auth/linkedin/callback', userFonc.linkedinLogin, (req, res) => {
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});

//	////////////////////////////////////////////////////////////////////////////

	app.get('/api/user/auth/spotify', (req, res, next) => {
		req.session.query = req.query;
		console.log(req.query);
		next();
	}, passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'] }));

	app.get('/api/user/auth/spotify/callback', userFonc.spotifyLogin, (req, res) => {
		console.log(req.session.query.next);
		res.set('Access-Control-Expose-Headers', 'x-access-token');
		res.set('x-access-token', req.session.token);
		return res.redirect(`${req.session.query.next}?token=${req.session.token}`);
	});
};
