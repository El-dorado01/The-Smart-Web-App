const mongoose = require("mongoose");

const ForumRankingsSchema = new mongoose.Schema(
  {
    forumID: {
      type: String,
      required: [true, "A forum ID is missing"],
    },
    newbie: {
      rankName: {
        type: String,
        default: "Newbie",
      },
      minUpvotesRequired: {
        type: Number,
        default: 0,
      },
    },
    rookie: {
      rankName: {
        type: String,
        default: "Rookie",
      },
      minUpvotesRequired: {
        type: Number,
        default: 5,
      },
    },
    apprentice: {
      rankName: {
        type: String,
        default: "Apprentice",
      },
      minUpvotesRequired: {
        type: Number,
        default: 15,
      },
    },
    explorer: {
      rankName: {
        type: String,
        default: "Explorer",
      },
      minUpvotesRequired: {
        type: Number,
        default: 30,
      },
    },
    contributor: {
      rankName: {
        type: String,
        default: "Contributor",
      },
      minUpvotesRequired: {
        type: Number,
        default: 50,
      },
    },
    enthusiast: {
      rankName: {
        type: String,
        default: "Enthusiast",
      },
      minUpvotesRequired: {
        type: Number,
        default: 75,
      },
    },
    collaborator: {
      rankName: {
        type: String,
        default: "Collaborator",
      },
      minUpvotesRequired: {
        type: Number,
        default: 105,
      },
    },
    communityRegular: {
      rankName: {
        type: String,
        default: "Community Regular",
      },
      minUpvotesRequired: {
        type: Number,
        default: 140,
      },
    },
    risingStar: {
      rankName: {
        type: String,
        default: "Rising Star",
      },
      minUpvotesRequired: {
        type: Number,
        default: 180,
      },
    },
    proficient: {
      rankName: {
        type: String,
        default: "Proficient",
      },
      minUpvotesRequired: {
        type: Number,
        default: 225,
      },
    },
    experienced: {
      rankName: {
        type: String,
        default: "Experienced",
      },
      minUpvotesRequired: {
        type: Number,
        default: 275,
      },
    },
    mentor: {
      rankName: {
        type: String,
        default: "Mentor",
      },
      minUpvotesRequired: {
        type: Number,
        default: 330,
      },
    },
    veteran: {
      rankName: {
        type: String,
        default: "Veteran",
      },
      minUpvotesRequired: {
        type: Number,
        default: 400,
      },
    },
    master: {
      rankName: {
        type: String,
        default: "Master",
      },
      minUpvotesRequired: {
        type: Number,
        default: 500,
      },
    },
    grandmaster: {
      rankName: {
        type: String,
        default: "Grandmaster",
      },
      minUpvotesRequired: {
        type: Number,
        default: 750,
      },
    },
    legendary: {
      rankName: {
        type: String,
        default: "Legendary",
      },
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
