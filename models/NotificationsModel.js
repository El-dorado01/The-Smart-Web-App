const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const NotificationsSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: [true, "User ID is missing"],
    },
    // Notification Order = notification-type [forum, channel], sub-type [topic-only, topic-and-response], forumID/channelID, topicID and responseID
    notifications: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("notification", NotificationsSchema);
