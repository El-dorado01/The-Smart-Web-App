const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ForumsSchema = new mongoose.Schema(
  {
    creator: {
      type: String,
      required: [true, "User ID is missing"],
    },
    forumName: {
      type: String,
      trim: true,
      required: [true, "A forum name must be provided"],
    },
    displayPic: {
      type: String,
      required: [true, "A display picture must be uploaded"],
    },
    forumDesc: {
      type: String,
      trim: true,
      required: [true, "Forum description must be provided"],
    },
    availableForLookUp: {
      type: Boolean,
      default: true,
    },
    wordsFilter: [
      {
        type: String,
      },
    ],
    ownerUpvotes: {
      type: Number,
      default: 0,
    },
    members: [
      {
        userID: {
          type: String,
        },
        memberStatus: {
          type: String,
          default: "active",
        },
        upvotes: {
          type: Number,
          default: 0,
        },
        numberOfWarns: {
          type: Number,
          default: 0,
          max: 5,
        },
        dateJoined: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    moderators: [
      {
        userID: {
          type: String,
        },
      },
    ],
    invites: [
      {
        incoming: {
          type: Boolean,
        },
        userID: {
          type: String,
        },
      },
    ],
    forumSecretKey: {
      type: String,
      default: uuidv4(),
    },
    membersCanInvite: {
      type: Boolean,
      default: false,
    },
    numberOfInvites: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("forum", ForumsSchema);
