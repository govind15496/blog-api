const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 1,
    },
    comment: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', CommentSchema);
