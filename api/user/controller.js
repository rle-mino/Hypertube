import jwt 			from 'jsonwebtoken';
import * as cfg		from './jwt/config';
import User			from './schema';

const safePath = [
	'/api/user/login',
	'/api/user/register',
	'/api/user/forgot_password',
	'/api/user/reset_password',
	'/api/user/confirm_mail',
	'/api/user/auth/42',
	'/api/user/auth/42/callback',
	'/api/user/auth/facebook',
	'/api/user/auth/facebook/callback',
];

const error = (err, req, res, next) => next();

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
			await User.findOne({ username: decoded.username , 'provider': decoded.provider }, (err, user) => {
				if (err) return res.send({ status: 'error', details: 'cant connect to db' });
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
	if (req.loggedUser.image.length > 0) return res.send({ status: 'success', image: req.loggedUser.image[0] });
	return res.send({ status: 'error', details: 'no picture' });
}

export {
	checkTokenMid,
	error,
	getPicture
};
