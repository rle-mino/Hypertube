import _ from 'lodash';
import Joi from 'joi';
import Movie from './movie_schema';

const create = async (req, res) => {
    const commentSchema = Joi.object().keys({
        comment: Joi.string().max(200).required(),
    });
    const { error } = Joi.validate(req.body, commentSchema, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) return res.send({ status: 'error', details: 'invalid request', error: error.details });
    const id = Math.random().toString(36).substring(7);
    const comment = {
        id,
        authorId: req.loggedUser._id,
        authorName: req.loggedUser.username,
        text: req.body.comment,
    };
    if (!req.body.id) return res.send({ status: 'error', details: 'invalid request' });
    const found = await Movie.findOne({ _id: req.body.id });
    found.comments.push(comment);
    found.save();
    const comments = found.comments.reverse().slice(0, 20);
    return (res.send({ status: 'success', comments }));
};

const remove = async (req, res) => {
	const { id, commentId } = req.body;
  if (!id) return res.send({ status: 'error', details: 'invalid request' });
  const found = await Movie.findOne({ _id: id });
  const isUnauthorized = found.comments.find((comment) =>
		comment.id === commentId && !_.isEqual(comment.authorId, req.loggedUser._id));
  if (!isUnauthorized) {
		const newComments = found.comments.filter(comment => comment.id !== commentId);
    found.comments = newComments;
    found.save();
    return (res.send({ status: 'success', comments: newComments }));
  }
	return (res.send({ status: 'error', details: 'unauthorized' }));
};


export { create, remove };
