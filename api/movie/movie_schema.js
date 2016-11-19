import mongoose from '../mongoose';

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  title: String,
  year: Number,
  rated: String,
  runtime: Number,
  countries: [String],
  poster: String,
  genres: [String],
  director: String,
  actors: [String],
  plot: String,
  code: String,
  rating: Number,
  torrents: Array,
  pop: Number,
  extended: { type: Boolean, default: false },
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
