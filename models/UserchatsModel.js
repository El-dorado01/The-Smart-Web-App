const mongoose = require("mongoose");

const UserchatsSchema = new mongoose.Schema(
  {
    initiator: {
      type: String,
      required: true,
    },
    member: {
      type: String,
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          required: true,
        },
        dateSent: {
          type: Date,
          required: true,
        },
        message: {
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

module.exports = mongoose.model("chatRoom", UserchatsSchema);
