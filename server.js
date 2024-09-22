// Require necessary packages
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// Initialize express
const app = express();

// Require Mongoose models from models.js
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

// Set the MongoDB URI; update with your actual environment variable or local URI as needed
const uri = process.env.MONGODB_URI || "mongodb+srv://sarahblauvelt74:Madcat111!@myapi.mplmq.mongodb.net/?retryWrites=true&w=majority&appName=myApi";

// MongoDB connection options
const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};

// Function to connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process if connection fails
  }
}

// Handle MongoDB connection errors and disconnections
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Retrying connection...');
  connectDB(); // Retry connection if disconnected
});

// Enable Mongoose debug mode to see database queries
mongoose.set('debug', true);

// Invoke CORS - cross-origin resource sharing
app.use(cors());

// Serve documentation.html file from the public folder
app.use(
  '/documentation',
  express.static('public', { index: 'documentation.html' })
);

// Initialize body-parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Import auth.js file (and express available in auth.js)
let auth = require('./auth')(app);

// Invoke middleware function (Morgan)
app.use(morgan('common'));

// Test route
app.get('/test', (req, res) => {
  res.send('Test route is working!');
});

// CREATE new user registration
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const hashedPassword = Users.hashPassword(req.body.Password);
      const existingUser = await Users.findOne({ Username: req.body.Username });

      if (existingUser) {
        return res.status(400).send(`${req.body.Username} already exists`);
      }

      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      });

      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Error creating user: ' + error.message);
    }
  }
);

// UPDATE user info by username
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Add a movie to a user's list of favorites
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
        console.log('POST /users called');
      });
  }
);

// DELETE movie from user favorites
app.delete(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// DELETE user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my Movies App!');
});

// READ ALL users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ ALL movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ movie data by TITLE
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ movie by GENRE
app.get(
  '/movies/Genre/:GenreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const genreName = req.params.GenreName;
      const movie = await Movies.findOne({ 'Genre.Name': genreName });

      if (movie) {
        res.status(200).json(movie.Genre);
      } else {
        res.status(400).send('No such genre');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// READ movie director by name
app.get(
  '/movies/Director/:DirectorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const directorName = req.params.DirectorName;
      const movie = await Movies.findOne({ 'Director.Name': directorName });

      if (movie) {
        res.status(200).json(movie.Director);
      } else {
        res.status(400).send('No such director');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// Error handling via middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server only after successful MongoDB connection
connectDB().then(() => {
  const port = process.env.PORT || 23691;
  app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
  });
});
