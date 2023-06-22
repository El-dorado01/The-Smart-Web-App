const mongoose = require("mongoose");

const MoviesSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      required: true,
    },
    channelID: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    releasedYear: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnail_id: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    fileUpload: {
      type: String,
      required: true,
    },
    fileUpload_id: {
      type: String,
      required: true,
    },
    likes: [
      {
        userID: {
          type: String,
          required: true,
        },
      },
    ],
    dislikes: [
      {
        userID: {
          type: String,
          required: true,
        },
      },
    ],
    views: [
      {
        userID: {
          type: String,
          required: true,
        },
      },
    ],
    comments: [
      {
        userID: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        userAvatar: {
          type: String,
          required: true,
        },
        userComment: {
          type: String,
          required: true,
        },
        uniqID: {
          type: String,
          required: true,
        },
        datePosted: {
          type: Date,
          required: true,
        },
        likes: [
          {
            userID: {
              type: String,
              required: true,
            },
          },
        ],
        moreComments: [
          {
            userID: {
              type: String,
              required: true,
            },
            username: {
              type: String,
              required: true,
            },
            userAvatar: {
              type: String,
              required: true,
            },
            userComment: {
              type: String,
              required: true,
            },
            datePosted: {
              type: Date,
              required: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("movie", MoviesSchema);
