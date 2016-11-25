import jwt 			from 'jsonwebtoken';
import Joi 			from 'joi';
import * as cfg		from './jwt/config';
import * as schema 	from './joiSchema';
import User			from './schema';

module.exports = (app, passport) => {
	const self = {
		login: (req, res, next) => {
			const { error } = Joi.validate(req.body, schema.loginSchema,
				{ abortEarly: false, stripUnknown: true });
			if (error) return res.send({ status: false, details: error.details });
			passport.authenticate('local-login', (err, user, info) => {
				if (err) { return res.send(err); }
				if (!user) { return res.send(info); }
				const token = jwt.sign({ _id: user._id, username: user.username }, cfg.jwtSecret);
				res.set('Access-Control-Expose-Headers', 'x-access-token');
				res.set('x-access-token', token);
				res.send({ status: 'success', user });
				return (false);
			})(req, res, next);
			return (false);
		},

		register: (req, res) => {
			const { error } = Joi.validate(req.body, schema.registerSchema,
				{ abortEarly: false, stripUnknown: true });
			if (error) return res.send({ status: false, details: error.details });
			const { username, password, firstname, lastname, mail } = req.body;
			process.nextTick(() => {
				User.findOne({ $and: [{ username }, { provider: 'local' }] }, (err, user) => {
					if (err) return res.send({ status: false, details: 'Cant connect to db' });
					if (user) return res.send({ status: false, details: 'username already used' });
					User.findOne({ $and: [{ mail }, { provider: 'local' }]}, (err, user) => {
						if (err) return res.send({ status: false, details: 'Cant connect to db' });
						if (user) return res.send({ status: false, details: 'mail already used' });
						const newUser = new User({
							mail,
							username,
							firstname,
							lastname,
							password,
							provider: 'local',
						});

						newUser.save((err) => {
							if (err) return res.send({ status: false, details: 'a problem occured' });
							const token = jwt.sign({ _id: user._id, username: user.username }, cfg.jwtSecret);
							res.set('Access-Control-Expose-Headers', 'x-access-token');
							res.set('x-access-token', token);
							return res.send({ status: true, details: 'success' });
						});
						return (false);
					});
					return (false);
				});
			});
			return (false);
		},

		schoolLogin: (req, res, next) => {
			passport.authenticate('42', (err, user, next) => {
				if (err) return res.send(err);
				if (!user) {
					return res.send({ status: false, details: 'error occured' });
				}
				const token = jwt.sign({ _id: user._id, username: user.username }, cfg.jwtSecret);
				res.set('Access-Control-Expose-Headers', 'x-access-token');
				res.set('x-access-token', token);
				return res.redirect(`${req.session.query.next}?token=${token}`);
			})(req, res, next);
		},
	};
	return self;
};
