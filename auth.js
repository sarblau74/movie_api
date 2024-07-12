const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('./passport'); // Your local passport file

module.exports = (app) => {
  app.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        const token = jwt.sign(user.toJSON(), jwtSecret, {
          subject: user.Username, // This is the username you're encoding in the JWT
          expiresIn: '7d', // Token expiration time
          algorithm: 'HS256', // Algorithm used to sign the JWT
        });

        return res.json({ user, token });
      });
    })(req, res);
  });
};
