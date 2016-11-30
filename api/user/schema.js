import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
	},
	mail: {
		type: String,
	},
	password: {
		type: String,
	},
	firstname: {
		type: String,
	},
	lastname: {
		type: String,
	},
	id: {
		type: String,
	},
	image: [String],
	provider: {
		type: String,
	},
	passToken: String,
}, {
	versionKey: false,
});
// UserSchema.methods.updatePass = (newPassword) => {
// 	const SALT_FACTOR = 5;
// 	bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
// 		if (err) return (err);
// 		bcrypt.hash(newPassword, salt, null, (err, hash) => {
// 			if (err) return (err);
// 			newPassword = hash;
// 			return (newPassword);
// 		});
// 	})
// };

UserSchema.pre('save', function(next) {
	const user = this,
	SALT_FACTOR = 5;
	if (!user.isModified('password')) return next();
	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
		if (err) return next(err);
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) return next(err);
			user.password = hash;
			next();
		});
		return (false);
	});
	return (false);
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);
