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

module.exports = (router) => {
    router.post('/login', (req, res) => {
      const { username, password } = req.body; // Extract username and password from request body
      passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
          console.log('Error: '+error)
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