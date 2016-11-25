import Joi from 'joi';

const registerSchema = Joi.object().keys({
	username: Joi.string().alphanum().min(3).max(16).required(),
	password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
	mail: Joi.string().email().required(),
	firstname: Joi.string().required(),
	lastname: Joi.string().required(),
});

const loginSchema = Joi.object().keys({
	username: Joi.string().min(3).max(30).required(),
	password: Joi.string().required(),
});

export { registerSchema, loginSchema };
