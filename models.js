const mongoose = require('mongoose');  // Add this line to import Mongoose

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: { type: String, required: true },
    Description: { type: String, required: true }
  },
  Director: {
    Name: { type: String, required: true },
    Bio: String,
    Birth: Date,
    Death: Date
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

let genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true }
});

let directorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: String,
  Birth: Date,
  Death: Date
});

let User = mongoose.model('User', userSchema);
let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);

module.exports.User = User;
module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.Director = Director;