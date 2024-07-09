const mongoose = require('mongoose');
const Models = require('./models.js');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

// Get all movies
app.get('/movies', (req, res) => {
    Movies.find()
        .then(movies => {
            res.status(200).json(movies);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a movie by title
app.get('/movies/:title', (req, res) => {
    console.log('Requested movie title:', req.params.title);
    Movies.findOne({ Title: req.params.title })
        .then(movie => {
            if (movie) {
                console.log('Movie found:', movie);
                res.status(200).json(movie);
            } else {
                console.log('Movie not found');
                res.status(404).send('Movie not found');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a genre by name
app.get('/genres/:name', (req, res) => {
    console.log('Requested genre name:', req.params.name);
    Genres.findOne({ Name: req.params.name })
        .then(genre => {
            if (genre) {
                console.log('Genre found:', genre);
                res.status(200).json(genre);
            } else {
                console.log('Genre not found');
                res.status(404).send('Genre not found');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a director by name
app.get('/directors/:name', (req, res) => {
    console.log('Requested director name:', req.params.name);
    Directors.findOne({ Name: req.params.name })
        .then(director => {
            if (director) {
                console.log('Director found:', director);
                res.status(200).json(director);
            } else {
                console.log('Director not found');
                res.status(404).send('Director not found');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow users to update their user info
app.put('/users/:username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.username }, { $set: req.body }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Allow users to add a movie to their list of favorites
app.post('/users/:username/movies/:movieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.username }, { $push: { FavoriteMovies: req.params.movieID } }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:movieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.username }, { $pull: { FavoriteMovies: req.params.movieID } }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.username })
        .then(user => {
            if (user) {
                res.send('User ' + req.params.username + ' was deleted.');
            } else {
                res.status(404).send('User not found');
            }
        })
        .catch(err => res.status(500).send('Error: ' + err));
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for requests

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
