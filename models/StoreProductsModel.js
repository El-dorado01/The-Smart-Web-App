const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const StoreProductsSchema = new mongoose.Schema(
  {
    storeID: {
      type: String,
      required: [true, "A store ID is missing"],
    },
    productName: {
      type: String,
      trim: true,
      required: [true, "A product name is required"],
    },
    productPrice: {
      type: Number,
      required: [true, "A price is required for this product"],
    },
    productDesc: {
      type: String,
      trim: true,
      required: [true, "A description is required for this product"],
    },
    productImgs: [
      {
        type: String,
        required: [
          true,
          "You should provide at least two images of your product",
        ],
      },
    ],
    category: [
      {
        type: String,
        required: [true, "You must provided a category for your product"],
      },
    ],
    discount: {
      discountPrice: {
        type: Number,
      },
      discountPercentage: {
        type: Number,
      },
    },
    favouritedBy: [
      {
        userID: {
          type: String,
        },
      },
    ],
    numberOfAvailableProduct: {
      type: String,
      default: "unlimited",
    },
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    productRatings: [
      {
        userID: {
          type: String,
        },
        rating: {
          type: Number,
        },
        reviewText: {
          type: String,
          trim: true,
        },
        mediaProof: {
          type: String,
        },
      },
    ],
    productOrders: [
      {
        userID: {
          type: String,
        },
        orderID: {
          type: String,
          default: uuidv4(),
        },
        dateOrdered: {
          type: Date,
          default: Date.now,
        },
        deliveryAddress: {
          type: String,
        },
        phoneContact: {
          type: Number,
        },
        qtyOrdered: {
          type: Number,
        },
        orderStatus: {
          type: String,
          default: "pending",
        },
        dateCompleted: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("storeProduct", StoreProductsSchema);
