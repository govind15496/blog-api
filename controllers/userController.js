const { body, validationResult, check } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { getJWTTOKEN } = require('../config/passport');

exports.user_sign_up_post = [
  // Validate and sanitize fields
  body('username').trim().escape(),
  check('username').custom(async (val, { req }) => {
    try {
      if (val === '' || val.length > 20) {
        throw new Error('Username must be between 1 and 20 characters');
      }
      const user = await User.findOne({ username: req.body.username }).exec();
      if (user) {
        throw new Error('That username is already taken');
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }),
  body('password').trim().escape(),
  check('password').custom(async (val, { req }) => {
    try {
      if (val === '' || val.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }),
  body('confirmPassword').trim().escape(),
  check('confirmPassword').custom(async (val, { req }) => {
    try {
      if (val !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }),

  // Process request after validation and sanitization
  async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);
    // There are errors. Respond with a status code with sanitized values/errors messages
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Registration Failed',
        user: {
          username: req.body.username,
        },
        errors: errors.array(),
      });
    }
    // Data is valid

    // Create a User object with escaped and trimmed data
    bcrypt.hash(req.body.password, 12, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
      });

      try {
        await user.save();

        // Create the token and send them
        const token = getJWTTOKEN(user);

        return res.status(201).json({
          success: true,
          message: 'Registration was successful',
          user: {
            _id: user._id,
            username: user.username,
            status: user.status,
          },
          token,
        });
      } catch (error) {
        return next(error);
      }
    });
  },
];

exports.user_sign_in_post = [
  // Validate and sanitize fields
  body('username').trim().escape(),
  check('username').custom(async (val, { req }) => {
    try {
      if (val === '') {
        throw new Error('Username must be between 1 and 20 characters');
      }
      const user = await User.findOne({ username: val }).exec();
      if (user === null) {
        throw new Error('That username is not found');
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }),
  body('password').trim().escape(),
  check('password').custom(async (val, { req }) => {
    try {
      const user = await User.findOne({ username: req.body.username }).exec();
      if (val === '') {
        throw new Error('Incorrect password');
      }
      if (user) {
        let passwordCheck = await bcrypt.compare(val, user.password);
        if (!passwordCheck) {
          throw new Error('Incorrect password');
        }
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }),

  // Process request after validation and sanitization
  async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);
    // There are errors. Respond with a status code with sanitized values/errors messages
    if (!errors.isEmpty()) {
      return res.status(401).json({
        success: false,
        message: 'Sign in failed',
        user: {
          username: req.body.username,
        },
        errors: errors.array(),
      });
    }
    // Data is valid

    // Authenticate user with escaped and trimmed data
    passport.authenticate('local', { session: false }, async (err, user) => {
      try {
        if (err) {
          return next(err);
        }
        req.login(user, { session: false }, async (error) => {
          const token = getJWTTOKEN(user);

          return res.status(200).json({
            success: true,
            message: 'Sign in was successful',
            user: {
              _id: user._id,
              username: user.username,
              status: user.status,
            },
            token,
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  },
];

exports.check_jwt_get = (req, res, next) => {
  // Authenticate and check jwt
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (info) {
      return res.status(401).json({
        success: false,
        message: info.message,
        user: null,
        token: null,
        errors: [{ param: '', msg: info.message }],
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Error checking JWT token',
        user: null,
        token: null,
        errors: [{ param: '', msg: 'Error checking JWT' }],
      });
    }
    if (user) {
      return res.status(200).json({
        success: true,
        message: 'JWT valid',
        token: getJWTTOKEN(user),
        user: { _id: user._id, username: user.username, status: user.status },
        error: null,
      });
    }
  })(req, res, next);
};
