const { body, validationResult } = require('express-validator');
const passport = require('passport');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { isAdmin } = require('../middlewares/isAdmin');
const { getUserIdFromHeader } = require('../utils/getUserIdFromHeader');
const { isObjectIdValid } = require('../utils/isObjectIdValid');

exports.post_list_get = async (req, res, next) => {
  Post.find()
    .populate('comments', 'username comment createdAt')
    .populate('author', 'username')
    .sort({ updatedAt: -1, createdAt: -1 })
    .exec(function (err, list_posts) {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        success: true,
        message: 'Fetch post was successful',
        posts: list_posts,
        errors: null,
      });
    });
};

exports.post_create_post = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  // Validate and sanitize fields
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content must be at least 1 character long')
    .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Respond with a status code with sanitized values/errors messages
      return res.status(400).json({
        success: false,
        message: 'Error create post failed',
        post: {
          title: req.body.title,
          content: req.body.content,
        },
        errors: errors.array(),
      });
    }
    // Data is valid

    try {
      // Get id from jwt token
      const userId = getUserIdFromHeader(req.headers['authorization']);

      // Create a Post object with escaped and trimmed data
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: userId,
        published: req.body.published || false,
      });
      await post.save();
      res.json({ success: true, message: 'Post Created', post, errors: null });
    } catch (error) {
      next(error);
    }
  },
];

exports.post_detail_get = async (req, res, next) => {
  try {
    isObjectIdValid(req, res, 'post');
    const post = await Post.findById(req.params.id)
      .populate('comments', 'username comment createdAt')
      .populate('author', 'username')
      .exec();
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
    return res.json({
      success: true,
      message: 'Post found',
      post,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.post_update_put = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  // Validate and sanitize fields
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title must be between 1 and 100 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content must be at least 1 character long')
    .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // There are errors. Respond with a status code with sanitized values/errors messages
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error could not update post',
        post: null,
        errors: errors.array(),
      });
    }
    // Data is valid

    try {
      // Get id from jwt token
      if (!req.headers['authorization']) {
        return res.status(403).json({ error: 'You must login first.' });
      }
      // Get user id from header
      const userId = getUserIdFromHeader(req.headers['authorization']);
      // Create a Post object with escaped and trimmed data
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: userId,
        published: req.body.published,
        comments: req.params.id,
        _id: req.params.id,
      });

      await Post.findByIdAndUpdate(req.params.id, post, {});
      return res.json({
        success: true,
        message: 'Post updated success',
        post,
        errors: null,
      });
    } catch (error) {
      next(error);
    }
  },
];

exports.post_remove_delete = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  async (req, res, next) => {
    try {
      isObjectIdValid(req, res, 'post');
      const post = await Post.findById(req.params.id)
        .populate('author', 'username')
        .exec();
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
      await Post.findByIdAndRemove(req.params.id);
      // Remove comments with post ID
      await Comment.deleteMany({ post: req.params.id });
      res.json({ success: true, message: 'Post deleted', errors: null });
    } catch (error) {
      next(error);
    }
  },
];
