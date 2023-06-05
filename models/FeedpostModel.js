const mongoose = require("mongoose");

const FeedPostsSchema = new mongoose.Schema(
  {
    poster: {
      type: String,
      required: true,
    },
    postText: {
      type: String,
      trim: true,
      maxlength: [300, "Text cannot be more 300 chars."],
    },
    files: [
      {
        filePath: {
          type: String,
          required: true,
        },
        altText: {
          type: String,
        },
      },
    ],
    whoCanComment: {
      type: String,
      required: true,
    },
    whoCanSee: {
      type: String,
      required: true,
    },
    threadID: {
      type: String,
      required: true,
    },
    likes: [
      {
        userID: {
          type: String,
          required: true,
        },
      },
    ],
    qouters: [
      {
        userID: {
          type: String,
          required: true,
        },
      },
    ],
    qoutedPost: [
      {
        postID: {
          type: String,
        },
      },
    ],
    commentedPost: [
      {
        postID: {
          type: String,
        },
      },
    ],
    saved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("feedPost", FeedPostsSchema);
