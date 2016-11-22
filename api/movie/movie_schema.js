import mongoose from '../mongoose';

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  title: String,
  year: Number,
  runtime: Number,
  poster: String,
  genres: [String],
  plot: String,
  code: String,
  rating: Number,
  torrents: Array,
  episodes: Array,
  pop: Number,
  // rated: String,
  // countries: [String],
  // director: String,
  // actors: [String],
  // extended: { type: Boolean, default: false },
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
