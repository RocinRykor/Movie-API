const express = require('express'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Models = require('./models.js');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));

// Define Database Models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to the database on the localhost using mongoose
mongoose.connect('mongodb://127.0.0.1/myMovDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET requests
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

//Documentation
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//API Routes

/**
 * Fucntion -> READ all movies
 *
 * Return -> JSON Object
 */
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Fucntion -> READ data from single movie
 * Param(s) -> :title = Movie Title
 *
 * Return -> JSON Object
 */
app.get('/movies/:title', (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Fucntion -> READ data from single genre
 * Param(s) -> :genreTitle
 *
 * Return -> JSON Object
 */
app.get('/genre/:genreTitle', (req, res) => {
    console.log(req.params.genreTitle);
    Movies.findOne({ 'Genre.Name': req.params.genreTitle })
        .then((movies) => {
            res.send(movies.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Fucntion -> READ data from single Director
 * Param(s) -> :directorName
 *
 * Return -> JSON Object
 */
app.get('/directors/:directorName', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
        .then((movies) => {
            res.send(movies.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Fucntion -> READ data from all Users
 *
 * Return -> JSON Object
 */
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Fucntion -> READ data from single user
 * Param(s) -> :userName
 *
 * Return -> JSON Object
 */
app.get('/users/:userName', (req, res) => {
    Users.findOne({ Username: req.params.userName })
        .then((User) => {
            res.status(200).json(User);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

/**
 * Fucntion -> CREATE data for a single User
 * Param(s) -> None
 * Request -> JSON Object
 * Return -> JSON Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.post('/users', (req, res) => {
    res.send('Successful POST request returning data on a new user');
});

/**
 * Fucntion -> PUT data for a single User
 * Param(s) -> id = User ID
 * Request -> JSON Object
 * Return -> JSON Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.put('/users/:id', (req, res) => {
    res.send('Successful PUT request returning new data on the user');
});

/**
 * Fucntion -> CREATE new movie entry for single user
 * Param(s) -> id = User ID, movieTitle, Movie title
 * Request -> None
 * Return -> Text Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.post('/users/:id/:movieTitle', (req, res) => {
    res.send('Successful POST request, added movie to users favorites');
});

/**
 * Fucntion -> DELETE movie entry for single user
 * Param(s) -> id = User ID
 * Request -> None
 * Return -> Text Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.delete('/users/:id/:movieTitle', (req, res) => {
    res.send('Successful DELETE request, movie deleted from users favorites');
});

/**
 * Fucntion -> DELETE single user
 * Param(s) -> id = User ID
 * Request -> None
 * Return -> Text Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.delete('/users/:id', (req, res) => {
    res.send('Successful DELETE request, User deleted');
});

//Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('INTERNAL SERVER ERROR');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
