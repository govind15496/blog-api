const jwt = require('jsonwebtoken');

exports.isAdmin = (req, res, next) => {
  const bearerHeaders = req.headers['authorization'];
  // if user exist token was sent with the request
  if (bearerHeaders) {
    const bearer = bearerHeaders.split(' ');
    const bearerToken = bearer[1];
    const decodedToken = jwt.decode(bearerToken);
    if (decodedToken.status === 'admin') {
      next();
    } else {
      res.status(401).json({
        success: false,
        message: 'You are not authorized',
        errors: [
          { param: 'auth', msg: 'You are not authorized to create a post' },
        ],
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: 'You must sign in first',
      errors: [
        {
          param: 'auth',
          msg: 'You must sign in first in order to create a post',
        },
      ],
    });
  }
};
