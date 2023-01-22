const passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	Models = require('./models.js'),
	passportJWT = require('passport-jwt');

const Users = Models.User,
	JWTStrategy = passportJWT.Strategy,
	ExtractJWT = passportJWT.ExtractJwt;

passport.use(
	new LocalStrategy(
		{
			usernameField: 'Username',
			passwordField: 'Password',
		},
		(username, password, callback) => {
			console.log('Login Attempt: ' + username);
			Users.findOne({ Username: username }, (error, user) => {
				if (error) {
					console.log(error);
					return callback(error);
				}

				if (!user) {
					console.log('incorrect username');
					return callback(null, false, {
						message: 'Incorrect username.',
					});
				}

				if (!user.validatePassword(password)) {
					console.log('incorrect password');
					return callback(null, false, {
						message: 'Incorrect password.',
					});
				}

				console.log('finished');
				return callback(null, user);
			});
		}
	)
);

passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'Top_Secret_JWT_Dont_Look_At_It',
		},
		(jwtPayload, callback) => {
			return Users.findById(jwtPayload._id)
				.populate('FavoriteMovies')
				.then((user) => {
					return callback(null, user);
				})
				.catch((error) => {
					return callback(error);
				});
		}
	)
);
