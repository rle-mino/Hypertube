import Joi from 'joi';

const registerSchema = Joi.object().keys({
	username: Joi.string().alphanum().min(3).max(16).required(),
	password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),
	mail: Joi.string().email().max(200).required(),
	firstname: Joi.string().min(1).max(30).required(),
	lastname: Joi.string().min(1).max(30).required(),
});

const loginSchema = Joi.object().keys({
	username: Joi.string().min(3).max(30).required(),
	password: Joi.string().required(),
});

const editSchema = Joi.object().keys({
	mail: Joi.string().email().max(200).required(),
	firstname: Joi.string().min(1).max(30).required(),
	lastname: Joi.string().min(1).max(30).required(),
	password: Joi.string().required(),
});

const resetPassSchema = Joi.object().keys({
	password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),
	newPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),
});

export { registerSchema, loginSchema, editSchema, resetPassSchema };
