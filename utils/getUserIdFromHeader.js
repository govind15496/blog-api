const jwt = require('jsonwebtoken');

exports.getUserIdFromHeader = (headers) => {
  const bearerToken = headers.split(' ')[1];
  const decodedToken = jwt.decode(bearerToken);
  return decodedToken._id;
};
