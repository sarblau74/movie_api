const express = require("express"),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();

let movies = [
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

// Create a write stream (in append mode)
const accesLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" });

// Setup the logger
app.use(morgan("combined", { stream: accesLogStream }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Welcome To Movie API ")
});

app.get("/movies", (req, res) => {
  res.json(movies)
});

app.get("/documentation", (req, res) => {
  res.senFile("public/documentation.html")
})

app.use((err, req, res, next) => { 
  console.error(err.stack);
  res.status(500).send("Something is broken!")
});

app.listen(8080, () => {
  console.log("Server is running on port 8080")
});