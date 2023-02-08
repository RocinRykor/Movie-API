const express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	uuid = require('uuid'),
	mongoose = require('mongoose'),
	Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const app = express();

// Define Database Models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to the database on the localhost using mongoose
// DEBUGGING

const CONNECTION_URL = process.env.CONNECTION_URI;

console.log(CONNECTION_URL);

mongoose.connect(CONNECTION_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Use CORS to setup Allowed Origins
const cors = require('cors');
app.use(cors());

// Require passport module and import passport.js file
const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
	res.sendFile('index.html', { root: __dirname });
});

// Documentation
app.get('/documentation', (req, res) => {
	res.sendFile('public/documentation.html', { root: __dirname });
});

//API Routes

/*
 * Fucntion -> READ all movies
 *
 * Return -> JSON Object
 */
app.get(
	'/movies',
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

/*
 * Function -> READ data from single movie
 * Param(s) -> (String) :title = Movie Title
 *
 * Return -> JSON Object
 */
app.get(
	'/movies/:title',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.findOne({ Title: req.params.title })
			.then((movie) => {
				res.status(200).json(movie);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

/*
 * Function -> READ data from single genre
 * Param(s) -> (String) :genreTitle
 *
 * Return -> JSON Object
 */
app.get(
	'/genre/:genreTitle',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		console.log(req.params.genreTitle);
		Movies.findOne({ 'Genre.Name': req.params.genreTitle })
			.then((movies) => {
				res.send(movies.Genre);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

/*
 * Function -> READ data from single Director
 * Param(s) -> (String) :directorName
 *
 * Return -> JSON Object
 */
app.get(
	'/directors/:directorName',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.findOne({ 'Director.Name': req.params.directorName })
			.then((movies) => {
				res.send(movies.Director);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

/*
 * Function -> READ data from all Users
 *
 * Return -> JSON Object
 */
app.get(
	'/users',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Users.find()
			.then((users) => {
				res.status(201).json(users);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

/*
 * Function -> READ data from single user
 * Param(s) -> (String) :Username
 *
 * Return -> JSON Object
 */
app.get(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Users.findOne({ Username: req.params.Username })
			.populate('FavoriteMovies')
			.then((User) => {
				res.status(200).json(User);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error ' + err);
			});
	}
);

/*
 * Function -> CREATE data for a single User, automatically hashes the password before inserting into DB
 * Request -> JSON Object
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
 *
 * Return -> JSON Object
 */

app.post(
	'/users',
	/* 
    Validation logic here for request:
    Username Requirements: Alphanumeric with Min Length of 3 Characters
    Password Requirements: Minimum of 10 Characters
    Email: Valid Email Address
    */
	[
		check('Username', 'Username is required').isLength({ min: 3 }),
		check(
			'Username',
			'Username contains non alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check(
			'Password',
			'Password is required, minimum length 10 characters'
		).isLength({ min: 10 }),
		check('Email', 'Email does not appear to be valid').isEmail(),
	],
	(req, res) => {
		// check the validation object for errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		const hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
			.then((user) => {
				if (user) {
					//If the user is found, send a response that it already exists
					return res
						.status(400)
						.send(req.body.Username + ' already exists');
				} else {
					Users.create({
						Username: req.body.Username,
						Password: hashedPassword,
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
	}
);

/*
 * Function -> PUT/UPDATE data for a single User
 * Param(s) -> (String) :Username
 * Request -> JSON Object
    Username: String, //(required)
    Password: String, //(required)
    Email: String,    //(required)
    Birthday: Date
 *
 * Return -> JSON Object
 */
app.put(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	/* 
    Validation logic here for request:
    Username Requirements: Alphanumeric with Min Length of 3 Characters
    Password Requirements: Minimum of 10 Characters
    Email: Valid Email Address
    */
	[
		check('Username', 'Username is required').isLength({ min: 3 }),
		check(
			'Username',
			'Username contains non alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check(
			'Password',
			'Password is required, minimum length 10 characters'
		).isLength({ min: 10 }),
		check('Email', 'Email does not appear to be valid').isEmail(),
	],
	(req, res) => {
		// check the validation object for errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		const hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
				$set: {
					Username: req.body.Username,
					Password: hashedPassword,
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
	}
);

/*
 * Function -> CREATE new movie entry for single user
 * Param(s) -> 
    (String) :Username
    (ObjectID) :MovieID
 *
 *  Return -> JSON Object
 */
app.post(
	'/users/:Username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
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
	}
);

/*
 * Function -> DELETE movie entry for single user
 * Param(s) -> 
    (String) :Username
    (ObjectID) :MovieID
 *
 *  Return -> JSON Object
 */
app.delete(
	'/users/:Username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
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
	}
);

/*
 * Function -> DELETE single user
 * Param(s) -> (String) :Username
 *
 * Return -> Text Object
 */
app.delete(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Users.findOneAndRemove({ Username: req.params.Username })
			.then((user) => {
				if (!user) {
					res.status(400).send(
						req.params.Username + ' was not found'
					);
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
// Error Handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('INTERNAL SERVER ERROR');
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on Port ' + port);
});
