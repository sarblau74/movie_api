const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Models = require('./models.js');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(passport.initialize());

// Database connection
mongoose.connect('mongodb://localhost:27017/cfDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // 30 seconds
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

// Models
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

// Passport configuration
require('./passport');

// Passport LocalStrategy for username-password authentication
passport.use(new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password'
}, (username, password, callback) => {
  Users.findOne({ Username: username }, (error, user) => {
    if (error) {
      return callback(error);
    }
    if (!user || !user.validatePassword(password)) {
      return callback(null, false, { message: 'Incorrect username or password' });
    }
    return callback(null, user);
  });
}));

// Route to handle user login and issue JWT token
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        return next(error);
      }
      const token = jwt.sign({ _id: user._id }, 'secret_key'); 
      return res.json({ token });
    });
  })(req, res, next);
});

// Route to register a new user
app.post('/users', (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(Password, 10); // 10 is the salt rounds

  Users.findOne({ Username: Username })
    .then(user => {
      if (user) {
        return res.status(400).send('Username already exists');
      } else {
        Users.create({
          Username: Username,
          Password: hashedPassword,
          Email: Email,
          Birthday: Birthday
        })
          .then((user) => res.status(201).json(user))
          .catch((error) => res.status(500).send('Error: ' + error));
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Route to get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(500).send('Error: ' + err));
});

// Route to get a movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie);
      } else {
        res.status(404).send('Movie not found');
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Route to get a genre by name
app.get('/genres/:name', (req, res) => {
  Genres.findOne({ Name: req.params.name })
    .then(genre => {
      if (genre) {
        res.status(200).json(genre);
      } else {
        res.status(404).send('Genre not found');
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Route to get a director by name
app.get('/directors/:name', (req, res) => {
  Directors.findOne({ Name: req.params.name })
    .then(director => {
      if (director) {
        res.status(200).json(director);
      } else {
        res.status(404).send('Director not found');
      }
    })
    .catch(err => res.status(500).send('Error: ' + err));
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).send('Resource not found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
