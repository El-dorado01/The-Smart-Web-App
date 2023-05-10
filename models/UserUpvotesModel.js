const mongoose = require("mongoose");

const UserUpvotesSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: [true, "A user ID is missing"],
    },
    myUpvotes: [
      {
        upvoteType: {
          type: String,
          enum: ["topic", "response"],
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
        dateUpvoted: {
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

module.exports = mongoose.model("userUpvote", UserUpvotesSchema);
