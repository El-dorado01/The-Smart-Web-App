const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      trim: true,
      required: [true, 'A Topic must be provided'],
    },
    text: {
      type: String,
      trim: true,
      required: [true, 'The text name must be provided'],
    },
    tags: {
      type: Array,
      default: [],
    },
    upvotes: {
      type: Array,
      default: [],
    },
    countViews: {
      type: Array,
      default: [],
    },
    comments: [
      {
        comment: String,
        upvotes: {
          type: Array,
          default: [],
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    forumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Forum',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('post', PostSchema);
