const mongoose = require("mongoose");

const MeetingsSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },
    roomDate: {
      type: String,
    },
    roomTime: {
      type: String,
    },
    roomCapacity: {
      type: String,
      required: true,
    },
    Host: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("liveMeeting", MeetingsSchema);
