const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ForumsTopicsSchema = new mongoose.Schema(
  {
    forumID: {
      type: String,
      required: [true, "A forum ID is missing for this topic"],
    },
    subject: {
      type: String,
      trim: true,
      required: [true, "A subject must be provided for this topic"],
    },
    userID: {
      type: String,
      required: [true, "User ID is missing for this topic"],
    },
    topicText: {
      type: String,
      required: [true, "A text is required for this subject"],
    },
    topicMedia: [
      {
        type: String,
      },
    ],
    topicTags: [
      {
        type: String,
      },
    ],
    bookmarks: [
      {
        userID: {
          type: String,
        },
      },
    ],
    upvotes: {
      type: Number,
      default: 0,
    },
    responses: [
      {
        responseID: {
          type: String,
          default: uuidv4(),
        },
        taggedResponseID: {
          type: String,
        },
        userID: {
          type: String,
        },
        replyText: {
          type: String,
        },
        replyMedia: [
          {
            type: String,
          },
        ],
        upvotes: {
          type: Number,
          default: 0,
        },
        dateReplied: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pinned: {
      type: Boolean,
      default: 0,
    },
    discussionClosed: {
      type: Boolean,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("forumTopic", ForumsTopicsSchema);
