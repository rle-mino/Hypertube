import jwt 			from 'jsonwebtoken';
import Joi 			from 'joi';
import * as cfg		from './jwt/config';
import * as schema 	from './joiSchema';
import User			from './schema';


module.exports = (app, passport) => {
	const self = {

		login: (req, res, next) => {
			const { error } = Joi.validate(req.body, schema.loginSchema, {
				abortEarly: false,
				stripUnknown: true
			});
			if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
			passport.authenticate('local-login', (err, user, info) => {
				if (err) { return res.send(err); }
				if (!user) { return res.send(info); }
				const token = jwt.sign({ _id: user._id, username: user.username, provider: 'local'}, cfg.jwtSecret);
				res.set('Access-Control-Expose-Headers', 'x-access-token');
				res.set('x-access-token', token);
				res.send({ status: 'success', user });
				return (false);
			})(req, res, next);
			return (false);
		},

		register: (req, res) => {
			const { error } = Joi.validate(req.body, schema.registerSchema, {
				abortEarly: false,
				stripUnknown: true
			});
			if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
			const { username, password, firstname, lastname, mail } = req.body;
			process.nextTick(() => {
				User.findOne({ $and: [{ username }, { provider: 'local' }] }, (err, user) => {
					if (err) return res.send({ status: 'error', details: 'Cant connect to db' });
					if (user) return res.send({ status: 'error', details: 'username already used' });
					User.findOne({ $and: [{ mail }, { provider: 'local' }]}, (err, user) => {
						if (err) return res.send({ status: 'error', details: 'Cant connect to db' });
						if (user) return res.send({ status: 'error', details: 'mail already used' });
						const newUser = new User({
							mail,
							username,
							firstname,
							lastname,
							password,
							provider: 'local',
						});

						newUser.save((err) => {
							if (err) return res.send({ status: 'error', details: 'a problem occured' });
							User.findOne({ $and: [{ username: newUser.username }, { provider: 'local' }] }, (err, user) => {
								if (err) return res.send({ status: 'error', details: 'Cant connect to db' });
								const token = jwt.sign({ _id: user._id, username: user.username, provider: 'local' }, cfg.jwtSecret);
								res.set('Access-Control-Expose-Headers', 'x-access-token');
								res.set('x-access-token', token);
								return res.send({ status: 'success', details: 'success' });
							})
						});
						return (false);
					});
					return (false);
				});
			});
			return (false);
		},

		schoolLogin: (req, res, next) => {
			passport.authenticate('42', (err, user) => {
				if (err) return res.send(err);
				if (!user) {
					return next();
				}
				const token = jwt.sign({ _id: user._id, username: user.username, provider: '42' }, cfg.jwtSecret);
				req.session.token = token;
				return next();
			})(req, res, next);
		},

		facebookLogin: (req, res, next) => {
			passport.authenticate('facebook', (err, user) => {
				if (err) return res.send(err);
				if (!user) {
					return next();
				}
				const token = jwt.sign({ _id: user._id, username: user.username, provider: 'facebook' }, cfg.jwtSecret);
				req.session.token = token;
				return next();
			})(req, res, next);
		},

		twitterLogin: (req, res, next) => {
			passport.authenticate('twitter', (err, user) => {
				if (err) return res.send(err);
				if (!user) return next();
				const token = jwt.sign({ _id: user._id, username: user.username, provider: 'twitter' }, cfg.jwtSecret);
				req.session.token = token;
				return next();
			})(req, res, next);
		},

		githubLogin: (req, res, next) => {
			passport.authenticate('github', (err, user) => {
				if (err) return res.send(err);
				if (!user) return next();
				const token = jwt.sign({ _id: user._id, username: user.username, provider: 'github' }, cfg.jwtSecret);
				req.session.token = token;
				return next();
			})(req, res, next);
		},

		googleLogin: (req, res, next) => {
			passport.authenticate('google', (err, user) => {
				if (err) return res.send(err);
				if (!user) return next();
				const token = jwt.sign({ _id: user._id, username: user.username, provider: 'google' }, cfg.jwtSecret);
				req.session.token = token;
				return next();
			})(req, res, next);
		},

		linkedinLogin: (req, res, next) => {
			passport.authenticate('linkedin', (err, user) => {
				if (err) return res.send(err);
				if (!user) return next();
				const token = jwt.sign({ _id: user._id, username: user.username, provider: 'linkedin' }, cfg.jwtSecret);
				req.session.token = token;
				return next();
			})(req, res, next);
		},


	};
	return self;
};
