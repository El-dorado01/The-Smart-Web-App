const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema(
  {
    forumDescription: {
      type: String,
      trim: true,
      required: [true, 'A description must be provided'],
    },
    forumName: {
      type: String,
      trim: true,
      required: [true, 'The forum name must be provided'],
    },
    forumImage: {
      type: String,
    },
    forumMembers: {
      type: Array,
      default: [],
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

module.exports = mongoose.model('forum', ForumSchema);
