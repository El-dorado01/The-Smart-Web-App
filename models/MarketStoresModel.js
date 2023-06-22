const mongoose = require("mongoose");

const MarketStoresSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: [true, "A userID is missing to create a store"],
    },
    storeName: {
      type: String,
      trim: true,
      required: [true, "A store name is requred"],
    },
    storeLogo: {
      type: String,
      required: [true, "A store logo is required"],
    },
    contactAddress: {
      type: String,
      trim: true,
      required: [true, "Contact address field is required"],
    },
    storeDesc: {
      type: String,
      trim: true,
      required: [true, "A description must be given to your store"],
    },
    phoneContact: {
      type: Number,
    },
    storeRatings: [
      {
        userID: {
          type: String,
        },
        rating: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("marketStore", MarketStoresSchema);
