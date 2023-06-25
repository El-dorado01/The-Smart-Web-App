const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ForumNotificationsSchema = new mongoose.Schema(
  {
    forumID: {
      type: String,
      required: [true, "Forum ID is missing"],
    },
    notificationSubscribers: [
      {
        userID: {
          type: String,
        },
        subscriptionType: {
          type: String,
        },
        enablePushNotifications: {
          type: Boolean,
          default: false,
        },
        pushNotifications: [
          {
            type: String,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("forumNotification", ForumNotificationsSchema);
