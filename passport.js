const passport = require('passport');
const passportJWT = require('passport-jwt');
const Models = require('./models.js');

const Users = Models.User;
const jwtSecretKey = 'secret_key'; // Ensure this matches the secret used when signing the JWT

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

// Configure JWT strategy for Passport
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecretKey
}, (jwtPayload, callback) => {
  // Find the user by ID from the JWT payload
  Users.findById(jwtPayload._id)
    .then(user => {
      if (user) {
        // User found, pass user to callback
        return callback(null, user);
      } else {
        // No user found, pass false to callback
        return callback(null, false);
      }
    })
    .catch(err => {
      // Error occurred, pass error to callback
      return callback(err, false);
    });
}));

module.exports = passport;
