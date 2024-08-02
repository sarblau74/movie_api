const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cfDB';
if (!mongoURI) {
  console.error('MONGODB_URI is not set');
  process.exit(1); // Exit the application if the URI is not set
}

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('common'));

// Express static function
app.use(express.static('public'));

// Passport configuration
require('./passport');
app.use(passport.initialize());

mongoose.set('strictQuery', true);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

// Auth routes
require('./auth')(app);

// Route to register a new user
app.post('/users', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists.');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => res.status(201).json(user))
          .catch((error) => res.status(500).send('Error: ' + error));
      }
    })
    .catch((error) => res.status(500).send('Error: ' + error));
});

// Login route
app.post('/login', async (req, res) => {
  const { Username, Password } = req.body;

  await Users.findOne({ Username: Username })
    .then((user) => {
      if (!user) {
        return res.status(400).send('User not found');
      }

      if (!user.validatePassword(Password)) {
        return res.status(400).send('Incorrect password');
      }

      const token = jwt.sign({ Username: user.Username }, 'your_jwt_secret', {
        expiresIn: '7d'
      });

      return res.status(200).json({ token: token });
    })
    .catch((error) => res.status(500).send('Error: ' + error));
});

// UPDATE
// A user's info, by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }
  )
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// UPDATE
// Add a movie to a user's list of favorites
app.patch('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  }, { new: true })
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// DELETE
// Delete a movie from a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  }, { new: true })
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// DELETE
// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(404).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

// READ
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// READ
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => res.status(201).json(movies))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// READ
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const title = req.params.title;
  const movie = await Movies.findOne({ Title: title });

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

// READ
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const genreName = req.params.genreName;
    const movie = await Movies.findOne({ 'Genre.Name': genreName });

    if (movie) {
      res.status(200).json(movie.Genre);
    } else {
      res.status(404).send('No such genre found');
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// READ
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const directorName = req.params.directorName;
    const movie = await Movies.findOne({ 'Director.Name': directorName });

    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(404).send('No such director');
    }
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// READ
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => res.status(201).json(users))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// READ
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => res.json(user))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// Middleware for serving static files from the public directory
app.use(express.static('public'));

// Error-handling middleware called when an error occurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server and listen for requests on port 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
