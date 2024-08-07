const jwtSecret = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken'),
  passport = require('passport');
require('./passport');

let allowedOrigins = ['*'];

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}

/**
 * Handles the login functionality.
 * 
 * @module loginRoute
 * @param {object} router - The router object from Express.
 */
module.exports = (router) => {
  /**
   * @function
   * @name POST /login
   * 
   * @summary Authenticates a user using the local strategy and generates a JWT token if successful.
   * 
   * @param {string} req.body.username - The username of the user attempting to log in.
   * @param {string} req.body.password - The password of the user attempting to log in.
   * @returns {Object} - Returns the user object without the password field and a JWT token.
   * @returns {Object} 400 - Returns an error message if authentication fails.
   */
  router.post('/login', (req, res) => {
    const { username, password } = req.body; // Extract username and password from request body
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        console.log('Error: ' + error)
        return res.status(400).json({
          message: error ? error : 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        // Exclude the password field from the user object
        const userWithoutPassword = { ...user.toObject() };
        delete userWithoutPassword.password;
        let token = generateJWTToken(user.toJSON());
        return res.json({ user: userWithoutPassword, token });
      });
    })(req, res);
    res.set('Access-Control-Allow-Origin', allowedOrigins);
  });
}