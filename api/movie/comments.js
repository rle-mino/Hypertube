import _ from 'lodash';
import Movie from './movie_schema';

const create = async (req, res) => {

    // add Joi validation

    const id = Math.random().toString(36).substring(7);
    const comment = {
        id,
        authorId: req.loggedUser._id,
        authorName: req.loggedUser.username,
        text: req.body.comment,
    };
    const found = await Movie.findOne({ _id: req.body.id });
    found.comments.push(comment);
    found.save();
    const comments = found.comments.reverse().slice(0, 20);
    return (res.send({ status: 'success', comments }));
};

const remove = async (req, res) => {
    const found = await Movie.findOne({ _id: req.body.id });
    const newComments = [];
    const isUnauthorized = found.comments.find((comment) => {
        if (comment.id === req.body.commentId) {
            if (!_.isEqual(comment.authorId, req.loggedUser._id)) {
                res.send({ status: 'error', details: 'unauthorized' });
                return true;
            }
            return false;
        }
        newComments.push(comment);
        return false;
    });
    if (!isUnauthorized) {
        found.comments = newComments;
        found.save();
        return (res.send({ status: 'success', comments: newComments }));
    }
    return false;
};


export { create, remove };
