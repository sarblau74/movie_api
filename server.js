const express = require('express');
const morgan = require('morgan');

const app = express();

let topMovies = [
    {
        id: 1,
        title: "The Godfather",
        director: "Francis Ford Coppola",
        genre: "Crime, Drama",
        releaseDate: "24 March 1972",
        rating: 9.2
    },
    {
        id: 2,
        title: "The Dark Knight",
        director: "Christopher Nolan",
        genre: "Action, Crime, Drama",
        releaseDate: "18 July 2008",
        rating: 9.0
    },
    {
        id: 3,
        title: "Pulp Fiction",
        director: "Quentin Tarantino",
        genre: "Crime, Drama",
        releaseDate: "14 October 1994",
        rating: 8.9
    },
    {
        id: 4,
        title: "Forrest Gump",
        director: "Robert Zemeckis",
        genre: "Drama, Romance",
        releaseDate: "6 July 1994",
        rating: 8.8
    },
    {
        id: 5,
        title: "Inception",
        director: "Christopher Nolan",
        genre: "Action, Adventure, Sci-Fi",
        releaseDate: "16 July 2010",
        rating: 8.8
    },
    {
        id: 6,
        title: "Fight Club",
        director: "David Fincher",
        genre: "Drama",
        releaseDate: "15 October 1999",
        rating: 8.8
    },
    {
        id: 7,
        title: "The Matrix",
        director: "Lana Wachowski, Lilly Wachowski",
        genre: "Action, Sci-Fi",
        releaseDate: "31 March 1999",
        rating: 8.7
    },
    {
        id: 8,
        title: "The Lord of the Rings: The Return of the King",
        director: "Peter Jackson",
        genre: "Action, Adventure, Drama",
        releaseDate: "17 December 2003",
        rating: 8.9
    },
        {
            id: 9,
            title: "The Silence of the Lambs",
            director: "Jonathan Demme",
            genre: "Crime, Drama, Thriller",
            releaseDate: "14 February 1991",
            rating: 8.6
        },
        {
            id: 10,
            title: "Schindler's List",
            director: "Steven Spielberg",
            genre: "Biography, Drama, History",
            releaseDate: "4 February 1994",
            rating: 9.0
        }
];

// Dummy user data for demonstration
let users = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com'
    },
    {
        id: 2,
        name: 'Jane Doe',
        email: 'jane.doe@example.com'
    }
];
// Express static function
app.use(express.static('public'));

// Middleware
app.use(morgan('common'));

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Define the /users route
app.get('/users', (req, res) => {
    res.json(users);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});