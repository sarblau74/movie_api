const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// Get all movies
app.get('/movies', (req, res) => {
    Movies.find()
        .then(movies => res.json(movies))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Get data about a single movie by title
app.get('/movies/:title', (req, res) => {
    Movies.findOne({ title: req.params.title })
        .then(movie => res.json(movie))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Get data about a genre by name
app.get('/genres/:name', (req, res) => {
    Movies.findOne({ 'genre.name': req.params.name })
        .then(movie => res.json(movie.genre))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Get data about a director by name
app.get('/directors/:name', (req, res) => {
    Movies.findOne({ 'director.name': req.params.name })
        .then(movie => res.json(movie.director))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Allow new users to register
app.post('/users', (req, res) => {
    Users.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday
    })
    .then(user => res.json(user))
    .catch(err => res.status(500).send('Error: ' + err));
});

// Allow users to update their user info
app.put('/users/:username', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, { $set: req.body }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Allow users to add a movie to their list of favorites
app.post('/users/:username/movies/:movieID', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, { $push: { favoriteMovies: req.params.movieID } }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:movieID', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, { $pull: { favoriteMovies: req.params.movieID } }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(500).send('Error: ' + err));
});

// Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
        .then(user => res.send('User ' + req.params.username + ' was deleted.'))
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
