// Check if the object id is valid
exports.isObjectIdValid = (req, res, name) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({
      success: false,
      message: 'Invalid id',
      data: null,
      errors: [
        {
          param: name,
          msg: `Must be a string of 12 bytes or a string of 24 hex characters or an integer`,
        },
      ],
    });
  }
};
