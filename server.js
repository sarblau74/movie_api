const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

// Sample data
let topMovies = [
    { id: 1, title: "The Godfather", director: "Francis Ford Coppola", genre: "Crime, Drama", releaseDate: "24 March 1972", rating: 9.2 },
    { id: 2, title: "The Dark Knight", director: "Christopher Nolan", genre: "Action, Crime, Drama", releaseDate: "18 July 2008", rating: 9.0 },
    { id: 3, title: "Pulp Fiction", director: "Quentin Tarantino", genre: "Crime, Drama", releaseDate: "14 October 1994", rating: 8.9 },
    { id: 4, title: "Forrest Gump", director: "Robert Zemeckis", genre: "Drama, Romance", releaseDate: "6 July 1994", rating: 8.8 },
    { id: 5, title: "Inception", director: "Christopher Nolan", genre: "Action, Adventure, Sci-Fi", releaseDate: "16 July 2010", rating: 8.8 },
    { id: 6, title: "Fight Club", director: "David Fincher", genre: "Drama", releaseDate: "15 October 1999", rating: 8.8 },
    { id: 7, title: "The Matrix", director: "Lana Wachowski, Lilly Wachowski", genre: "Action, Sci-Fi", releaseDate: "31 March 1999", rating: 8.7 },
    { id: 8, title: "The Lord of the Rings: The Return of the King", director: "Peter Jackson", genre: "Action, Adventure, Drama", releaseDate: "17 December 2003", rating: 8.9 },
    { id: 9, title: "The Silence of the Lambs", director: "Jonathan Demme", genre: "Crime, Drama, Thriller", releaseDate: "14 February 1991", rating: 8.6 },
    { id: 10, title: "Schindler's List", director: "Steven Spielberg", genre: "Biography, Drama, History", releaseDate: "4 February 1994", rating: 9.0 }
];

// Dummy user data
let users = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' }
];

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
    res.json(topMovies);
});

// Get all users
app.get('/users', (req, res) => {
    res.json(users);
});

// Add a new user
app.post('/users', (req, res) => {
    console.log('POST /users request received with body:', req.body);
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send('Name and email are required.');
    }
    const newUser = {
        id: users.length + 1,
        name,
        email
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Add a new movie
app.post('/movies', (req, res) => {
    console.log('POST /movies request received with body:', req.body);
    const { title, director, genre, releaseDate, rating } = req.body;
    if (!title || !director || !genre || !releaseDate || !rating) {
        return res.status(400).send('All fields are required.');
    }
    const newMovie = {
        id: topMovies.length + 1,
        title,
        director,
        genre,
        releaseDate,
        rating
    };
    topMovies.push(newMovie);
    res.status(201).json(newMovie);
});

// Delete a user by ID
app.delete('/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
        return res.status(404).send('User not found.');
    }
    users.splice(index, 1);
    res.status(200).send('User deleted successfully.');
});

// Delete a movie by ID
app.delete('/movies/:movieId', (req, res) => {
    const movieId = parseInt(req.params.movieId);
    const index = topMovies.findIndex(movie => movie.id === movieId);
    if (index === -1) {
        return res.status(404).send('Movie not found.');
    }
    topMovies.splice(index, 1);
    res.status(200).send('Movie deleted successfully.');
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