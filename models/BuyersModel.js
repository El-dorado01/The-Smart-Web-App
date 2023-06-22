const mongoose = require("mongoose");

const BuyersSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: [true, "A user ID is missing in the buyer's profile"],
    },
    productFavourites: [
      {
        productID: {
          type: String,
        },
      },
    ],
    cart: [
      {
        productID: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("buyer", BuyersSchema);
