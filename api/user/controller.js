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

const apiURL = 'http://localhost:8080/api';

const safePath = [
	'/api/user/login',
	'/api/user/public',
	'/api/user/register',
	'/api/user/forgot_password',
	'/api/user/reset_password',
	'/api/user/confirm_mail',
	'/api/user/auth/42',
	'/api/user/auth/42/callback',
	'/api/stream',
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
	if (safePath.indexOf(req.path) !== -1) return next();
	const token = getToken(req);
	if (!token) return res.send({ status: 'error', details: 'user not authorized' });
	jwt.verify(token, cfg.jwtSecret, async (err, decoded) => {
		if (err) return res.send({ status: 'error', details: 'invalid token' });
		try {
			await User.findOne({ username: decoded.username, provider: decoded.provider }, (erro, user) => {
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
			fs.readFile(`${__dirname}/../../public/${req.file.filename}`, (errors) => {
				if (!errors) fs.unlinkSync(`${__dirname}/../../public/${filename}`);
			});
			return res.send({ status: 'error', details: `${log.username} already have 5 images` });
		}
		req.loggedUser.image = filename;
		req.loggedUser.save();
		return res.send({ status: 'success', details: `${log.username}'s images are now up to date`, filename });
});

const getProfile = (req, res) => {
	const image = `${apiURL}/user/public/${req.loggedUser.image[0]}`;
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

const resetPassword = (req, res) => {
	const { error } = Joi.validate(req.body, schema.resetPassSchema, {
		abortEarly: false,
		stripUnknown: true,
	});
	if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
	const { username, code } = req.body;
	let { password } = req.body;
	process.nextTick(() => {
		User.findOne({ username, provider: 'local' }, (err, user) => {
			if (err) return res.send({ status: 'error', details: 'cant connect to db' });
			if (!user) return res.send({ status: 'error', details: 'user doesnt exist' });
			const SALT_FACTOR = 5;
			bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
				if (err) return res.send(err);
				bcrypt.hash(newPassword, salt, null, (err, hash) => {
					if (err) return res.send(err);
					password = hash;
					user.update({ $set: { password } }, (error) => {
						if (error) return res.send({ status: 'false', details: 'Cant connect to db' });
						return res.send({ status: 'success', details: 'password successfully updated' });
					});
		});
	});
	});
});
};

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
		User.findOne({ username, provider: 'local' },  (err, user) => {
			if (err) return res.send(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) return res.send({ status: 'error', details: 'user doesnt exist' });
			user.comparePassword(password, (error, isMatch) => {
				if (error) return res.send({ status: 'error', details: 'Cant connect to db' });
				if (!isMatch) return res.send({ status: 'error', details: 'wrong password' });
				const SALT_FACTOR = 5;
				bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
					if (err) return res.send(err);
					bcrypt.hash(newPassword, salt, null, (err, hash) => {
						if (err) return res.send(err);
						newPassword = hash;
						user.update({ $set: { password: newPassword } }, (error) => {
							if (error) return res.send({ status: 'false', details: 'Cant connect to db' });
							return res.send({ status: 'success', details: 'password successfully updated' });
						});
						});
					})
				});
			});
		});
	};

const editProfile = (req, res) => {
	const { error } = Joi.validate(req.body, schema.editSchema, {
		abortEarly: false,
		stripUnknown: true,
	});
	if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
	const { password, mail, firstname, lastname } = req.body;
	const { username } = req.loggedUser;
	process.nextTick(() => {
		User.findOne({ username, provider: 'local' }, (err, user) => {
			if (err) return res.send(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) return res.send({ status: 'error', details: 'user doenst exist' });
			User.findOne({ mail, provider: 'local' }, (erro, user) => {
				if (erro) return res.send({ status: 'error', details: 'cant connect to db' });
				if (user) return res.send({ status: 'error', details: 'mail already used' });
				user.comparePassword(password, (error, isMatch) => {
					if (erro) return res.send(error);
					if (!isMatch) return res.send({ status: 'error', details: 'wrong password' });
					user.update({ $set: { firstname, lastname, mail } }, (errorss) => {
						if (errorss) return res.send({ status: 'error', details: 'Cant connect to db' });
						return res.send({ status: 'success', details: 'user successfully updated' });
					});
					return (false);
				})
			});
			return (false);
		});
	});
	return (false);
};

export {
	checkTokenMid,
	errors,
	getPicture,
	uploadPic,
	getProfile,
	editProfile,
	changePassword,
	forgotPassword,
};
