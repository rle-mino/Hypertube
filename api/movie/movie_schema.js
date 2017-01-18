import mongoose from '../mongoose';

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  title: String,
  year: Number,
  runtime: Number,
  poster: String,
  genres: [String],
  plot: String,
  code: { type: String, unique: true },
  rating: Number,
  torrents: Array,
  episodes: Array,
  pop: Number,
  comments: Array,
  // rated: String,
  // countries: [String],
  director: String,
  writer: String,
  actors: [String],
  lastViewed: Number,
  // extended: { type: Boolean, default: false },
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
