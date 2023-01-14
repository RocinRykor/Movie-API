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

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

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
app.get(
    '/movies',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.find()
            .then((movies) => {
                res.status(201).json(movies);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    }
);

/**
 * Fucntion -> READ data from single movie
 * Param(s) -> (String) :title = Movie Title
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
 * Param(s) -> (String) :genreTitle
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
 * Param(s) -> (String) :directorName
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
 * Param(s) -> (String) :Username
 *
 * Return -> JSON Object
 */
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
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
 * Request -> JSON Object
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
 *
 * Return -> JSON Object
 */

app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res
                    .status(400)
                    .send(req.body.Username + 'already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                })
                    .then((user) => {
                        res.status(201).json(user);
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * Fucntion -> PUT/UPDATE data for a single User
 * Param(s) -> (String) :Username
 * Request -> JSON Object
    Username: String, //(required)
    Password: String, //(required)
    Email: String,    //(required)
    Birthday: Date
 *
 * Return -> JSON Object
 */

app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
            },
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

/**
 * Fucntion -> CREATE new movie entry for single user
 * Param(s) -> 
    (String) :Username
    (ObjectID) :MovieID
 *
 *  Return -> JSON Object
 */
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $push: { FavoriteMovies: req.params.MovieID },
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

/**
 * Fucntion -> DELETE movie entry for single user
 * Param(s) -> 
    (String) :Username
    (ObjectID) :MovieID
 *
 *  Return -> JSON Object
 */
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $pull: { FavoriteMovies: req.params.MovieID },
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

/**
 * Fucntion -> DELETE single user
 * Param(s) -> (String) :Username
 *
 * Return -> Text Object
 */

app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
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
