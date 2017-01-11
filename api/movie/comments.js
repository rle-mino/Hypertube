import Movie from './movie_schema';

const create = async (req, res) => {
    console.log(req.loggedUser, req.body);
    const comment = {
        authorId: req.loggedUser._id,
        authorName: req.loggedUser.username,
        text: req.body.comment,
    };
    const found = await Movie.findOne({ _id: req.body.id });
    found.comments.push(comment);
    found.save();
};

export { create };
