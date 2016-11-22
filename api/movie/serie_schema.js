import mongoose from '../mongoose';

const Schema = mongoose.Schema;

const serieSchema = new Schema({
  title: String,
  year: Number,
  runtime: Number,
  poster: String,
  genres: [String],
  plot: String,
  code: String,
  rating: Number,
  episodes: Array,
  pop: Number,
  // extended: { type: Boolean, default: false },
});

const Serie = mongoose.model('Serie', serieSchema);

export default Serie;
