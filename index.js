const express = require('express');
morgan = require('morgan');

const app = express();

  // test

  let topMovies = [
    {
        title: 'Alien',
        director: 'Ridley Scott'
    },
    {
        title: 'Aliens',
        director: 'James Cameron'
    },
    {
        title: 'The Mummy',
        director: 'Stephen Sommers'
    },
    {
        title: 'Starship Troopers',
        director: 'Paul Verhoeven'
    },
    {
        title: 'Battle: Los Angeles',
        director: 'Jonathan Liebesman'
    },
    {
        title: 'The Last Voyage of the Demeter',
        director: 'André Øvredal'
    },
    {
        title: 'Avatar',
        director: 'James Cameron'
    },
    {
        title: 'Inception',
        director: 'Christoper Nolan'
    },
    {
        title: 'Fearless',
        director: 'Ronny Yu'
    },
    {
        title: 'The Karate Kid',
        director: 'Harald Zwart'
    },
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

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});