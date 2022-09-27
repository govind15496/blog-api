const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      minLength: 1,
      maxLength: 20,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['reader', 'admin'],
      default: 'reader',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
