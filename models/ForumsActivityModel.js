const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ForumsActivitySchema = new mongoose.Schema(
  {
    userID: {
      type: String,
    },
    activities: [
      {
        activity: {
          type: String,
          enum: [
            "post",
            "response",
            "bookmark",
            "upvoteTopic",
            "upvoteResponse",
          ],
        },
        forumID: {
          type: String,
        },
        topicID: {
          type: String,
        },
        responseID: {
          type: String,
        },
        datePerformed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("forumsActivity", ForumsActivitySchema);
