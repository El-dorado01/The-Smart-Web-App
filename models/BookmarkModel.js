const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      unique: true,
    },
    posts: [
      {
        postID: {
          type: String,
          required: true,
          unique: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("smartNetworkBookmark", BookmarkSchema);
