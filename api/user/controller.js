import fs			from 'fs';
import path			from 'path';
import _			from 'lodash';
import nodemailer	from 'nodemailer';
import multer		from 'multer';
import Joi from 'joi';
import bcrypt from 'bcrypt-nodejs';
import jwt 			from 'jsonwebtoken';
import User			from './schema';
import * as schema 	from './joiSchema';
import * as cfg		from './jwt/config';

const apiURL = `http://localhost:${process.env.SERVER_PORT}/api`;

const safePath = [
	// '/api/movie/history',
	'/api/user/reset',
	'/api/user/login',
	'/api/user/forgot',
	'/api/user/public',
	'/api/user/register',
	'/api/user/confirm_mail',
	'/api/user/auth/42',
	'/api/user/auth/42/callback',
	'/api/user/auth/facebook',
	'/api/user/auth/facebook/callback',
	'/api/user/auth/twitter',
	'/api/user/auth/twitter/callback',
	'/api/user/auth/github',
	'/api/user/auth/github/callback',
	'/api/user/auth/google',
	'/api/user/auth/google/callback',
	'/api/user/auth/linkedin',
	'/api/user/auth/linkedin/callback',
	'/api/user/auth/spotify',
	'/api/user/auth/spotify/callback',
];

const errors = (err, req, res, next) => next();

const mailer = (dest, content, obj) => {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'hypertubeapi@gmail.com ',
			pass: 'Hypertube1212',
		},
	});
	const mailOptions = {
			from: 'Hypertube@gmail.com',
			to: dest,
			subject: obj,
			text: content,
	};
	transporter.sendMail(mailOptions);
};

const getToken = (req) => {
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
		return req.query.token;
    }
    return null;
};

const checkTokenMid = async (req, res, next) => {
	if (safePath.indexOf(req.path) !== -1 || /\/api\/stream.*/.test(req.path) === true ||
		/\/ht.*/.test(req.path) === true || /\/public\/subtitles.*/.test(req.path) === true) {
		return next();
	}
	const token = getToken(req);
	if (!token) return res.send({ status: 'error', details: 'user not authorized' });
	jwt.verify(token, cfg.jwtSecret, async (err, decoded) => {
		if (err) return res.send({ status: 'error', details: 'invalid token' });
		try {
			await User.findOne({
				username: decoded.username,
				provider: decoded.provider,
			},
			(erro, user) => {
				if (erro) return res.send({ status: 'error', details: 'cant connect to db' });
				req.loggedUser = user;
				return next();
			});
		} catch (e) {
			return res.send({ status: 'error', details: 'an error occured' });
		}
		return (true);
	});
	return (false);
};

const getPicture = (req, res) => {
	if (req.loggedUser.provider.includes('local')) {
		return res.send({
			status: 'success',
			image: `${apiURL}/user/public/${req.loggedUser.image[0]}`,
		});
	}
	if (req.loggedUser.image.length > 0) {
		return res.send({
			status: 'success',
			image: req.loggedUser.image[0],
		});
	}
	return res.send({ status: 'error', details: 'no picture' });
};

const upload = multer({ dest: `${__dirname}/../public` }).single('image');

const addExtensionFilename = async (filename, mimetype) => {
	const publicFolder = path.resolve('public');
	const newName = mimetype === 'image/jpeg' ? `${filename}.jpg` : `${filename}.png`;
	fs.renameSync(`${publicFolder}/${filename}`, `${publicFolder}/${newName}`);
	return (newName);
};

const uploadPic = (req, res) => upload(req, res, async (err) => {
		if (!req.file) return res.send({ status: 'error', details: 'image required' });
		if (err) return res.send({ status: 'error', details: 'an error occured' });
		if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
			return res.send({ status: 'error', details: 'Cannot use this file as image' });
		}
		const log = req.loggedUser;
		const filename = await addExtensionFilename(req.file.filename, req.file.mimetype);
		if (log.images && log.images.length === 5) {
			fs.readFile(`${__dirname}/../../public/${req.file.filename}`, (errorss) => {
				if (!errorss) fs.unlinkSync(`${__dirname}/../../public/${filename}`);
			});
			return res.send({ status: 'error', details: `${log.username} already have 5 images` });
		}
		req.loggedUser.image = filename;
		req.loggedUser.save();
		return res.send({ status: 'success', details: `${log.username}'s images are now up to date`, filename });
});

const getProfile = (req, res) => {
	let image = null;
	image = req.loggedUser.image[0];
	if (req.loggedUser.provider === 'local') {
		image = `${apiURL}/user/public/${req.loggedUser.image[0]}`;
	}
	const profile = _.pick(req.loggedUser, [
		'mail',
		'username',
		'firstname',
		'lastname',
		'provider',
	]);
	profile.image = image;
	return res.send({ status: 'success', profile });
};

// Send Mail
const forgotPassword = (req, res) => {
	const { error } = Joi.validate(req.body, schema.forgotPassSchema, {
		abortEarly: false,
		stripUnknown: true,
	});
	if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
	const { mail } = req.body;
	process.nextTick(() => {
		User.findOne({ mail, provider: 'local' }, (err, user) => {
			if (err) return res.send({ status: 'error', details: 'Cant connect to db' });
			if (!user) return res.send({ status: 'error', details: 'mail doesnt exist' });
			const confirmKey = Math.random().toString(16).substring(2, 8);
			user.passToken = confirmKey;
			user.save();
			mailer(mail, `Use this code to reset your password ${confirmKey}`, 'Reset your password');
			return res.send({ status: 'success', details: 'mail has been sent' });
		});
	});
	return (false);
};

// Reset mail after mail
const resetPassword = (req, res) => {
	const { error } = Joi.validate(req.body, schema.resetPassSchema, {
		abortEarly: false,
		stripUnknown: true,
	});
	if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
	const { username, passToken } = req.body;
	let { password } = req.body;
	process.nextTick(() => {
		User.findOne({ $or: [{ username }, { mail: username }], provider: 'local' }, (err, user) => {
			if (err) return res.send({ status: 'error', details: 'cant connect to db' });
			if (!user) return res.send({ status: 'error', details: 'user doesnt exist' });
			User.findOne({ username, passToken }, (erro, user1) => {
				if (erro) return res.send({ status: 'error', details: 'cant connect to db' });
				if (!user1) return res.send({ status: 'error', details: 'wrong code' });
				const SALT_FACTOR = 5;
				bcrypt.genSalt(SALT_FACTOR, (err2, salt) => {
					if (err2) return res.send(err2);
					bcrypt.hash(password, salt, null, (er, hash) => {
						if (er) return res.send(er);
						password = hash;
						user1.update({ $set: { password } }, (er1) => {
							if (er1) return res.send({ status: 'false', details: 'Cant connect to db' });
							return res.send({ status: 'success', details: 'password successfully updated' });
						});
						return (false);
					});
					return (false);
				});
				return (false);
			});
			return (false);
		});
	});
	return (false);
};

// Change Mail
const changePassword = (req, res) => {
	const { error } = Joi.validate(req.body, schema.changePassSchema, {
		abortEarly: false,
		stripUnknown: true,
	});
	if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
	const { username } = req.loggedUser;
	let { newPassword } = req.body;
	const { password } = req.body;
	process.nextTick(() => {
		User.findOne({ username, provider: 'local' }, (err, user) => {
			if (err) return res.send(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) return res.send({ status: 'error', details: 'user doesnt exist' });
			user.comparePassword(password, (errorr, isMatch) => {
				if (errorr) return res.send({ status: 'error', details: 'Cant connect to db' });
				if (!isMatch) return res.send({ status: 'error', details: 'wrong password' });
				const SALT_FACTOR = 5;
				bcrypt.genSalt(SALT_FACTOR, (errs, salt) => {
					if (errs) return res.send(errs);
					bcrypt.hash(newPassword, salt, null, (errss, hash) => {
						if (errss) return res.send(errss);
						newPassword = hash;
						user.update({ $set: { password: newPassword } }, (erro) => {
							if (erro) return res.send({ status: 'false', details: 'Cant connect to db' });
							return res.send({ status: 'success', details: 'password successfully updated' });
						});
						return (false);
					});
					return (false);
				});
				return (false);
			});
			return (false);
		});
	});
	return (false);
};

const editProfile = (req, res) => {
	const { error } = Joi.validate(req.body, schema.editSchema, {
		abortEarly: false,
		stripUnknown: true,
	});
	if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
	const { password, mail, firstname, lastname } = req.body;
	const { username } = req.loggedUser;
	let sameMail = 0;
	if (req.loggedUser.mail === mail) sameMail = 1;
	process.nextTick(() => {
		User.findOne({ username, provider: 'local' }, (err, user) => {
			if (err) return res.send(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) return res.send({ status: 'error', details: 'user doesnt exist' });
			if (sameMail === 0) {
			User.findOne({ mail, provider: 'local' }, (users) => {
					if (users) {
						return res.send({ status: 'error', details: 'mail already used' });
					}
					req.loggedUser.comparePassword(password, (erro, isMatch) => {
						if (erro) return res.send(erro);
						if (!isMatch) return res.send({ status: 'error', details: 'wrong password' });
						req.loggedUser.update({ $set: { firstname, lastname, mail } }, (errorss) => {
							if (errorss) return res.send({ status: 'error', details: 'Cant connect to db' });
							return res.send({ status: 'success', details: 'user successfully updated' });
						});
						return (false);
					});
					return (false);
				});
			} else if (sameMail === 1) {
				req.loggedUser.comparePassword(password, (erro, isMatch) => {
					if (erro) return res.send(erro);
					if (!isMatch) return res.send({ status: 'error', details: 'wrong password' });
					req.loggedUser.update({ $set: { firstname, lastname, mail } }, (errorss) => {
						if (errorss) return res.send({ status: 'error', details: 'Cant connect to db' });
						return res.send({ status: 'success', details: 'user successfully updated' });
					});
					return (false);
				});
			}
			return (false);
		});
	});
	return (false);
};

export {
	checkTokenMid,
	resetPassword,
	errors,
	getPicture,
	uploadPic,
	getProfile,
	editProfile,
	changePassword,
	forgotPassword,
};
