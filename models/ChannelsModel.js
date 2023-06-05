const mongoose = require("mongoose");

const ChannelsSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    channelName: {
      type: String,
      required: true,
    },
    channelDescription: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    subscribers: [
      {
        userID: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("channel", ChannelsSchema);
