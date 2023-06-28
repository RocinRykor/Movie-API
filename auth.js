const jwtSecret = 'Top_Secret_JWT_Dont_Look_At_It'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); // Your local passport file

/**
 * Generate a JWT token for the user.
 *
 * @param user Pass in the username and password to encode
 * @return A token that can be sent back to a user
 */
function generateJWTToken(user) {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256', // This is the algorithm used to “sign” or encode the values of the JWT
  });
}

module.exports = (router) => {
  router.post(
      '/login',
      (req, res) => {
        /**
         * Handles the POST request to /login, authenticates a user.
         * @param user Passed in user (username and pass)
         * @return {json} Authenticated User and Token
         */
        passport.authenticate('local', {session: false}, (error, user) => {
          if (error || !user) {
            return res.status(400).json({
              message: 'Something is not right',
              user: user,
            });
          }
          req.login(user, {session: false}, (error) => {
            if (error) {
              res.send(error);
            }
            let token = generateJWTToken(user.toJSON());
            return res.json({user, token});
          });
        })(req, res);
      },
  );
};
