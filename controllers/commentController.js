const { body, validationResult } = require('express-validator');
const passport = require('passport');
const Comment = require('../models/comment');
const Post = require('../models/post');
const { isAdmin } = require('../middlewares/isAdmin');
const { isObjectIdValid } = require('../utils/isObjectIdValid');

exports.comment_create_post = [
  // Validate and sanitize fields
  body('username')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Username must be between 1 and 20 characters')
    .escape(),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // There are errors. Respond with a status code with sanitized values/errors messages
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Create comment failed',
        comment: {
          username: req.body.username,
          comment: req.body.comment,
        },
        errors: errors.array(),
      });
    }
    // Data is valid

    try {
      isObjectIdValid(req, res, 'comment');
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'No post found',
          post: {},
          errors: [
            {
              param: 'post',
              msg: `No post found with provided id: ${req.params.id}`,
            },
          ],
        });
      }
      // Create a Comment object with escaped and trimmed data
      const comment = new Comment({
        username: req.body.username,
        comment: req.body.comment,
        post: req.params.id,
      });
      await comment.save();
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comments: comment.id } }
      );
      res.json({
        success: true,
        message: 'Comment created',
        comment,
        errors: null,
      });
    } catch (error) {
      next(error);
    }
  },
];

exports.comment_remove_delete = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  async (req, res, next) => {
    try {
      isObjectIdValid(req, res, 'comment');
      const comment = await Comment.findById(req.params.id)
        .populate('username comment')
        .exec();
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'No comment found',
          comment: {},
          errors: [
            {
              param: 'comment',
              msg: `No comment found with provided id: ${req.params.id}`,
            },
          ],
        });
      }
      await Comment.findByIdAndRemove(req.params.id);
      const post = Post.find({ comments: { _id: req.params.id } });
      await post.updateOne({
        $pull: {
          comments: req.params.id,
        },
      });
      res.json({ success: true, message: 'Comment deleted', errors: null });
    } catch (error) {
      next(error);
    }
  },
];
