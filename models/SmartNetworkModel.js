const mongoose = require("mongoose");

const SmartNetworkSchema = new mongoose.Schema(
  {
    notes: {
      type: String,
      required: [true, "Notes must be provided"],
    },
    fileUploads: {
      type: String,
      required: [true, "A file must be provided"],
    },
    category: {
      type: String,
      required: [true, "Field cannot be left blank"],
      trim: true,
    },
    likes: [
      {
        user: String,
      },
    ],
    comments: [
      {
        user: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        uniqID: {
          type: String,
          required: true,
        },
        datePosted: {
          type: Date,
          required: true,
        },
        moreComments: [
          {
            moreUser: {
              type: String,
              required: true,
            },
            moreUsername: {
              type: String,
              required: true,
            },
            moreUserAvatar: {
              type: String,
              required: true,
            },
            moreUserMessage: {
              type: String,
              required: true,
              trim: true,
            },
            datePosted: {
              type: Date,
              required: true,
            },
          },
        ],
      },
      {
        timestamps: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("smartNetworkFeed", SmartNetworkSchema);
