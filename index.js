const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');
const multer = require('multer');

const {check, validationResult} = require('express-validator');

const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');

const app = express();

// Define Database Models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to the database on the localhost using mongoose
const CONNECTION_URL = process.env.CONNECTION_URI;

const IMAGE_BUCKET = process.env.IMAGE_BUCKET;

const s3Client = new S3Client({
  region: 'us-east-1',
});

console.log(CONNECTION_URL);

mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(morgan('common'));
app.use(express.static('public'));

// Use CORS to set up Allowed Origins
const cors = require('cors');
app.use(cors());

// Require passport module and import passport.js file
const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const authorizeJWT = (req, res, next) => {
  passport.authenticate('jwt', {session: false})(req, res, next);
};

// GET requests
app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname});
});

// Documentation
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

//API Routes

/**
 * Reads data from all movies.
 * @returns {Object} JSON object representing the collection of movie data.
 */
app.get(
    '/movies',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Movies.find().then((movies) => {
        res.status(201).json(movies);
      }).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
    },
);

/**
 * Reads data from a single movie.
 * @param {string} movieTitle - The title of the movie.
 * @returns {Object} JSON object representing the movie data.
 */
app.get(
    '/movies/:title',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Movies.findOne({Title: req.params.title}).then((movie) => {
        res.status(200).json(movie);
      }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
    },
);

/**
 * Reads data from a single genre.
 * @param {string} genreTitle - The title of the genre.
 * @returns {Object} JSON object representing the genre data.
 */
app.get(
    '/genre/:genreTitle',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      console.log(req.params.genreTitle);
      Movies.findOne({'Genre.Name': req.params.genreTitle}).then((movies) => {
        res.send(movies.Genre);
      }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
    },
);

/**
 * Reads data from a single Director.
 * @param {string} directorName - The name of the Director.
 * @returns {Object} JSON object representing the Director data.
 */
app.get(
    '/directors/:directorName',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Movies.findOne({'Director.Name': req.params.directorName}).
          then((movies) => {
            res.send(movies.Director);
          }).
          catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          });
    },
);

/**
 * Reads data from all users.
 * @returns {Object} JSON object representing the user data.
 */
app.get(
    '/users',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Users.find().then((users) => {
        res.status(201).json(users);
      }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
    },
);

/**
 * Reads data from a single user.
 * @param {string} Username - The username of the user.
 * @returns {Object} JSON object representing the user data.
 */
app.get(
    '/users/:Username',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Users.findOne({Username: req.params.Username}).
          populate('FavoriteMovies').
          then((User) => {
            res.status(200).json(User);
          }).
          catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
          });
    },
);

/**
 * Creates data for a single user. Automatically hashes the password before inserting into the database.
 * @param {Object} Request - JSON object containing the user data.
 * @property {string} Username - The username of the user.
 * @property {string} Password - The password of the user.
 * @property {string} Email - The email of the user.
 * @property {Date} Birthday - The birthday of the user.
 * @returns {Object} JSON object representing the created user data.
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
      check('Username', 'Username is required').isLength({min: 3}),
      check(
          'Username',
          'Username contains non alphanumeric characters - not allowed.',
      ).isAlphanumeric(),
      check(
          'Password',
          'Password is required, minimum length 10 characters',
      ).isLength({min: 10}),
      check('Email', 'Email does not appear to be valid').isEmail(),
    ],
    (req, res) => {
      // check the validation object for errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }

      const hashedPassword = Users.hashPassword(req.body.Password);
      Users.findOne(
          {Username: req.body.Username}) // Search to see if a user with the requested username already exists
          .then((user) => {
            if (user) {
              //If the user is found, send a response that it already exists
              return res.status(400).
                  send(req.body.Username + ' already exists');
            } else {
              Users.create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
              }).then((user) => {
                res.status(201).json(user);
              }).catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
              });
            }
          }).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
    },
);

/**
 * Updates/Edits data for a single user. Automatically hashes the password before inserting into the database.
 * @param {string} Username - name of the user being edited
 * @param {Object} Request - JSON object containing the user data.
 * @property {string} Username - Updated username of the user.
 * @property {string} Password - Updated password of the user.
 * @property {string} Email - Updated email of the user.
 * @property {Date} Birthday - Updated birthday of the user.
 * @returns {Object} JSON object representing the updated user data.
 */
app.put(
    '/users/:Username',
    passport.authenticate('jwt', {session: false}),
    /*
      Validation logic here for request:
      Username Requirements: Alphanumeric with Min Length of 3 Characters
      Password Requirements: Minimum of 10 Characters
      Email: Valid Email Address
      */
    [
      check('Username', 'Username is required').isLength({min: 3}),
      check(
          'Username',
          'Username contains non alphanumeric characters - not allowed.',
      ).isAlphanumeric(),
      check(
          'Password',
          'Password is required, minimum length 10 characters',
      ).isLength({min: 10}),
      check('Email', 'Email does not appear to be valid').isEmail(),
    ],
    (req, res) => {
      // check the validation object for errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }

      const hashedPassword = Users.hashPassword(req.body.Password);
      Users.findOneAndUpdate(
          {Username: req.params.Username},
          {
            $set: {
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday,
            },
          },
          {new: true}, // This line makes sure that the updated document is returned
          (err, updatedUser) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error: ' + err);
            } else {
              res.json(updatedUser);
            }
          },
      );
    },
);

/**
 * Adds a single movie to users favorite list.
 * @param {string} Username - The username of the user.
 * @param {ObjectID} movieID - ObjectID of the movie being added
 * @returns {Object} JSON object representing the updated user data.
 */
app.post(
    '/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Users.findOneAndUpdate(
          {Username: req.params.Username},
          {
            $push: {FavoriteMovies: req.params.MovieID},
          },
          {new: true}, // This line makes sure that the updated document is returned
          (err, updatedUser) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error: ' + err);
            } else {
              res.json(updatedUser);
            }
          },
      );
    },
);

/**
 * Removes a single movie from users favorite list.
 * @param {string} Username - The username of the user.
 * @param {ObjectID} movieID - ObjectID of the movie being removed
 * @returns {Object} JSON object representing the updated user data.
 */
app.delete(
    '/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Users.findOneAndUpdate(
          {Username: req.params.Username},
          {
            $pull: {FavoriteMovies: req.params.MovieID},
          },
          {new: true}, // This line makes sure that the updated document is returned
          (err, updatedUser) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error: ' + err);
            } else {
              res.json(updatedUser);
            }
          },
      );
    },
);

/**
 * Deletes a single user
 * @param {string} Username - The username of the user.
 * @returns {String} Returns status of user deletion
 */
app.delete(
    '/users/:Username',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
      Users.findOneAndRemove({Username: req.params.Username}).then((user) => {
        if (!user) {
          res.status(400).send(
              req.params.Username + ' was not found',
          );
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      }).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
    },
);

// Update the routes and functions
app.get(
    '/images/:movieId/',
    authorizeJWT,
    async (req, res) => {
      try {
        const movieId = req.params.movieId;

        console.log('Fetching Movies: ', movieId);

        const command = new ListObjectsV2Command({
          Bucket: IMAGE_BUCKET,
          Prefix: `resized-images/${movieId}/`,
        });

        const response = await s3Client.send(command);

        res.status(200).json(response);
      } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      }
    },
);

app.get(
    '/images/:objectKey',
    authorizeJWT,
    async (req, res) => {
      try {
        const objectKey = req.params.objectKey;
        const command = new GetObjectCommand({
          Bucket: IMAGE_BUCKET,
          Key: objectKey,
        });

        const response = await s3Client.send(command);

        res.status(200).json(response);
      } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      }
    },
);

// Create a storage engine using multer
const storage = multer.memoryStorage(); // Use memory storage for storing files temporarily

// Create a multer instance with the storage engine
const upload = multer({storage: storage});

// Use the upload middleware when handling the POST request
app.post(
  '/images/:movieId/',
  authorizeJWT,
  upload.single('file'), // 'file' should match the field name in your FormData
  async (req, res) => {
    try {
      const movieId = req.params.movieId;
      const fileContent = req.file.buffer; // Use req.file.buffer to access the file content
      const fileName = req.file.originalname

      console.log("Movie ID", movieId);
      console.log("File Content", fileContent);

      const command = new PutObjectCommand({
        Bucket: IMAGE_BUCKET,
        Key: `original-images/${movieId}/${fileName}`, // Make sure to define 'fileName' somewhere in your code.
        Body: fileContent,
      });

      const response = await s3Client.send(command);

      res.status(200).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
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
