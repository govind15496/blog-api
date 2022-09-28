const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_TOKEN_SECRET } = process.env;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      session: false,
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Invalid username' });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid passowrd' });
        }
        return done(null, user, { message: 'Signed in successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload._id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

exports.getJWTTOKEN = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      status: user.status,
    },
    JWT_TOKEN_SECRET,
    { expiresIn: 24 * 60 * 60 }
  );
};

exports.verifyUser = passport.authenticate('jwt', { session: false });
