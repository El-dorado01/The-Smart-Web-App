require("express-async-errors");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const AuthModel = require("../../models/AuthModel");
const BuyersModel = require("../../models/BuyersModel");
const MarketStoresModel = require("../../models/MarketStoresModel");
const StoreProductsModel = require("../../models/StoreProductsModel");

const deleteAProductFromStore = async (data) => {
  const { storeID, userID, productID } = data;

  const storeInfo = await MarketStoresModel.findById(storeID);
  //Check if user is the store owner
  if (userID == storeInfo.userID) {
    const productDeleted = await StoreProductsModel.findByIdAndDelete(
      productID
    );
    if (productDeleted)
      console.log(
        "Product " + productID + " has been deleted from store " + storeID
      );
  }
};

const updateProductFavouritesAndCarts = async (data) => {
  const { userID, productID, actionType } = data;

  switch (actionType) {
    case "addToFavourites":
      const addedToFavourites = await BuyersModel.findOneAndUpdate(
        { userID },
        { $push: { productFavourites: { productID } } }
      );

      if (addedToFavourites)
        console.log("Product " + productID + " has been added to favourites!");
      break;

    case "addToCart":
      const addedToCart = await BuyersModel.findOneAndUpdate(
        { userID },
        { $push: { cart: { productID } } }
      );

      if (addedToCart)
        console.log("Product " + productID + " has been added to cart!");
      break;

    case "removeFromCart":
      const removedFromCart = await BuyersModel.findOneAndUpdate(
        { userID },
        { $pull: { cart: { productID } } }
      );

      if (removedFromCart)
        console.log("Product " + productID + " has been removeed from cart!");
      break;

    default:
      //Remove from favourites by default
      const removedFromFavourites = await BuyersModel.findOneAndUpdate(
        { userID },
        { $pull: { productFavourites: { productID } } }
      );

      if (removedFromFavourites)
        console.log(
          "Product " + productID + " has been removed from favourites!"
        );
      break;
  }
};

const rateAStore = async (data) => {
  const { storeID, userID, rating } = data;

  const storeRated = await MarketStoresModel.findByIdAndUpdate(
    { _id: storeID },
    { $push: { storeRatings: { userID, rating } } }
  );

  if (storeRated)
    console.log(
      "You have rated store " + storeID + " with a rating of " + rating
    );
};

const deleteProductReview = async (data) => {
  const { productID, userID } = data;

  const reviewDeleted = await MarketStoresModel.findByIdAndUpdate(
    { _id: productID },
    { $pull: { "productRatings.userID": userID } }
  );

  if (reviewDeleted)
    console.log("Your review on product " + productID + " has been deleted!");
};

const makeOrder = async (orders) => {
  for (let i = 0; i < orders.length; i++) {
    var { productID, userID, deliveryAddress, phoneContact, qtyOrdered } =
      orders[i];
    var orderCompleted = await StoreProductsModel.findById(
      { _id: productID },
      {
        $push: {
          productOrders: { userID, deliveryAddress, phoneContact, qtyOrdered },
        },
      }
    );

    if (orderCompleted)
      console.log(
        "Your order with ID " + orderCompleted.orderID + " has been completed!"
      );
  }
};

module.exports = {
  deleteAProductFromStore,
  updateProductFavouritesAndCarts,
  rateAStore,
  deleteProductReview,
  makeOrder,
};
