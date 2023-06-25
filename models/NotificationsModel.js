const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const NotificationsSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: [true, "User ID is missing"],
    },
    // Notification Order = notification-type [forum, channel], sub-type [topic-only, topic-and-response], forumID/channelID, topicID and responseID
    // var notificationObj = {
    //   notificationType: "forum",
    //   subType: "topic",
    //   forumID,
    //   forumName: forumInfo.forumName
    //   topicID: topicCreated._id,
    //   posterID: user.userId,
    //   posterName: user.userName
    // }
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
