const mongoose = require("mongoose");

const ForumRankingsSchema = new mongoose.Schema(
  {
    forumID: {
      type: String,
      required: [true, "A forum ID is missing"],
    },
    newbie: {
      minUpvotesRequired: {
        type: Number,
        default: 0,
      },
    },
    rookie: {
      minUpvotesRequired: {
        type: Number,
        default: 5,
      },
    },
    apprentice: {
      minUpvotesRequired: {
        type: Number,
        default: 15,
      },
    },
    explorer: {
      minUpvotesRequired: {
        type: Number,
        default: 30,
      },
    },
    contributor: {
      minUpvotesRequired: {
        type: Number,
        default: 50,
      },
    },
    enthusiast: {
      minUpvotesRequired: {
        type: Number,
        default: 75,
      },
    },
    collaborator: {
      minUpvotesRequired: {
        type: Number,
        default: 105,
      },
    },
    communityRegular: {
      minUpvotesRequired: {
        type: Number,
        default: 140,
      },
    },
    risingStar: {
      minUpvotesRequired: {
        type: Number,
        default: 180,
      },
    },
    proficient: {
      minUpvotesRequired: {
        type: Number,
        default: 225,
      },
    },
    experienced: {
      minUpvotesRequired: {
        type: Number,
        default: 275,
      },
    },
    mentor: {
      minUpvotesRequired: {
        type: Number,
        default: 330,
      },
    },
    veteran: {
      minUpvotesRequired: {
        type: Number,
        default: 400,
      },
    },
    master: {
      minUpvotesRequired: {
        type: Number,
        default: 500,
      },
    },
    grandmaster: {
      minUpvotesRequired: {
        type: Number,
        default: 750,
      },
    },
    legendary: {
      minUpvotesRequired: {
        type: Number,
        default: 1500,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("forumRanking", ForumRankingsSchema);
