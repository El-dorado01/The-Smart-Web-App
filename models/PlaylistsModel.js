const mongoose = require("mongoose");

const PlaylistsSchema = new mongoose.Schema(
  {
    playlistName: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
    },
    channelID: {
      type: String,
    },
    movies: [
      {
        movieID: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
          required: true,
        },
        channel: {
          type: String,
          required: true,
        },
        title: {
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

module.exports = mongoose.model("playlist", PlaylistsSchema);
