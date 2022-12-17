const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));

let topMovie = [
    {
        id: 1,
        title: 'Abraham Lincoln: Vampire Hunter',
        actors: ['Benjamin Walker', 'Dominic Cooper'],
    },
    {
        id: 2,
        title: '300',
        actors: ['Gerard Butler', 'Michael Fassbender'],
    },
    {
        id: 3,
        title: 'Iron Man',
        actors: ['Robert Downey jr.', 'Jeff Bridges'],
    },
    {
        id: 4,
        title: 'The Imitation Game',
        actors: ['Benedict Cumberbatch', 'Keira Knightley'],
    },
    {
        id: 5,
        title: 'Sherlock Holmes: A Game of Shadows',
        actors: ['Benedict Cumberbatch', 'Jude Law'],
    },
    {
        id: 6,
        title: 'Doctor Strange',
        actors: ['Benedict Cumberbatch', 'Chiwetel Ejiofor'],
    },
    {
        id: 7,
        title: 'Black Panther',
        actors: ['Chadwick Boseman', 'Michael B. Jordan'],
    },
    {
        id: 8,
        title: 'John Wick',
        actors: ['Keanu Reeves', 'Michael Nyqvist'],
    },
    {
        id: 9,
        title: 'Kingsman: The Secret Service',
        actors: ['Colin Firth', 'Samuel L. Jackson'],
    },
    {
        id: 10,
        title: 'Robin Hood: Men In Tights',
        actors: ['Cary Elwes', 'Roger Rees'],
    },
];

// GET requests
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

//Documentation
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//API Routes
/*
None of the routes below have their handler functions implemented
Each simply returns a success string for the time being
*/

/**
 * Fucntion -> READ all movies
 * Param(s) -> None
 * Request -> None
 * Return -> JSON Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.get('/movies', (req, res) => {
    res.send('Successful GET request returning data on all the movies');
});

/**
 * Fucntion -> READ data from single movie
 * Param(s) -> title = Movie Title
 * Request -> None
 * Return -> JSON Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.get('/movies/:title', (req, res) => {
    res.send('Successful GET request returning data on a single movie');
});

/**
 * Fucntion -> READ data from single genre
 * Param(s) -> genreTitle = Genre Title
 * Request -> None
 * Return -> JSON Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.get('/genre/:genreTitle', (req, res) => {
    res.send('Successful GET request returning data on a single genre');
});

/**
 * Fucntion -> READ data from single Director
 * Param(s) -> directorName = Director Name
 * Request -> None
 * Return -> JSON Object
 *
 * TODO - STATUS -> INCOMPLETE/NOT IMPLEMENTED
 */
app.get('/directors/:directorName', (req, res) => {
    res.send('Successful GET request returning data on a single director');
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
