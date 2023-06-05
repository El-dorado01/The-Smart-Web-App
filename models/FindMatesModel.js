const mongoose = require("mongoose");

const FindMatesSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: [true, "A user ID is missing for the find mates"],
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "A first name is required"],
    },
    otherNames: {
      type: String,
      trim: true,
      required: [true, "Other names field is required"],
    },
    nickname: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "The gender field is required"],
    },
    age: {
      type: Number,
      required: [true, "The age field is required"],
    },
    briefInfo: {
      type: String,
    },
    height: {
      type: String,
    },
    profession: {
      type: String,
    },
    fullBodyImg: {
      type: String,
      required: [true, "A full body image is required"],
    },
    selfieImg: {
      type: String,
      required: [true, "A selfie image is required"],
    },
    //Checks if user is verified, verified by default
    userStatus: {
      type: Boolean,
      default: true,
    },
    //Checks if user account is active, active by default
    accountStatus: {
      type: Boolean,
      default: true,
    },
    defaultMateChoice: {
      age: {
        type: Number,
        default: 0,
      },
      gender: {
        type: String,
        default: "all",
      },
    },
    removeMatesFromSuggestion: [
      {
        userID: {
          type: String,
        },
      },
    ],
    favouriteMates: [
      {
        userID: {
          type: String,
        },
      },
    ],
    mateMatchRequests: [
      {
        userID: {
          type: String,
        },
        timeSent: {
          type: Date,
          default: Date.now,
        },
        // expires
      },
    ],
    matchedMates: [
      {
        userID: {
          type: String,
        },
        timeMatched: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    mediaUploads: [
      {
        type: String,
      },
    ],
    lastSeenLatitude: {
      type: Number,
    },
    lastSeenLongitude: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("findMate", FindMatesSchema);
