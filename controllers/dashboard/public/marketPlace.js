const path = require("path");
const fs = require("fs");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");
const AuthModel = require("../../../models/AuthModel");
const MarketStoresModel = require("../../../models/MarketStoresModel");
const StoreProductsModel = require("../../../models/StoreProductsModel");
const BuyersModel = require("../../../models/BuyersModel");

const marketPlace = async (req, res) => {
  const page_name = req.path;

  const fetchAllProducts = await StoreProductsModel.find({}).sort("-createdAt");

  res.locals.products = fetchAllProducts;
  res.status(StatusCodes.OK).render("./dashboard/public/market_place", {
    headTitle: "Market Place",
    page_name,
  });
};

const singleProduct = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const productID = req.params.productID;

  const productInfo = await StoreProductsModel.findById(productID);

  res.locals.productInfo = productInfo;
  res.status(StatusCodes.OK).render("./dashboard/public/market_place", {
    headTitle: "Market Place - Product: " + productInfo.productName,
    page_name,
  });
});

const createStorePage = (req, res) => {
  const page_name = req.path;

  res.status(StatusCodes.OK).render("./dashboard/public/create_store", {
    headTitle: "Market Place - Create Store",
    page_name,
  });
};

/**
 ===================================================================================================
 OPERATIONS PERFORMED AS A STORE OWNER
 -- Create Store
 -- Update Store Info
 -- Add a new product to store
 -- Update Product Info
 -- Delete a product from store (Done with SocketIO)
 -- Mark Order as completed (Done with socketIO)
 ===================================================================================================
 */

const createStore = asyncWrapper(async (req, res) => {
  const { storeName, contactAddress, phoneContact, storeDesc } = req.body;
  const { storeLogo } = req.files;
  let storeLogoPath;
  let uploadOk = 1;

  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  var allowedFiles = storeLogo.mimetype;
  var fileSize = storeLogo.size;
  var maxSize = 5000000;

  if (allowedFiles && allowedFiles.startsWith("image/")) {
    if (fileSize > maxSize) {
      res.send("File is too big");
      uploadOk = 0;
    } else {
      const storeLogoName = uuidv4() + "_" + storeLogo.name.split(".")[0];

      cloudinary.uploader.upload(
        storeLogo.tempFilePath,
        {
          resource_type: "image",
          public_id: `storeLogos/${storeLogoName}`,
        },
        async function (err, logo) {
          if (err) {
            console.log(err);
            uploadOk = 0;
          } else {
            storeLogoPath = logo.secure_url;
            uploadOk = 1;

            //Delete file from temp folder
            fs.unlinkSync(storeLogo.tempFilePath);

            //Send success back to frontend
            // res.json({ forumInfo });
          }
        }
      );

      if (uploadOk == 1) {
        const storeCreated = await MarketStoresModel.create({
          userID: user.userId,
          storeName,
          storeLogo: storeLogoPath,
          contactAddress,
          storeDesc,
          phoneContact,
        });

        if (storeCreated)
          console.log(
            "You " + user.userId + " have created a store called " + storeName
          );
      }
    }
  }
});

const updateStoreInfo = asyncWrapper(async (req, res) => {
  const { storeID, storeName, contactAddress, phoneContact, storeDesc } =
    req.body;

  if (req.files.storeLogo) {
    const { storeLogo } = req.files;
    let storeLogoPath;

    var allowedFiles = storeLogo.mimetype;
    var fileSize = storeLogo.size;
    var maxSize = 5000000;

    if (allowedFiles && allowedFiles.startsWith("image/")) {
      if (fileSize > maxSize) {
        res.send("File is too big");
        uploadOk = 0;
      } else {
        const storeLogoName = uuidv4() + "_" + storeLogo.name.split(".")[0];

        cloudinary.uploader.upload(
          storeLogo.tempFilePath,
          {
            resource_type: "image",
            public_id: `storeLogos/${storeLogoName}`,
          },
          async function (err, logo) {
            if (err) {
              console.log(err);
              uploadOk = 0;
            } else {
              storeLogoPath = logo.secure_url;
              uploadOk = 1;

              //Delete file from temp folder
              fs.unlinkSync(storeLogo.tempFilePath);

              const storeInfoUpdated =
                await MarketStoresModel.findByIdAndUpdate(
                  { _id: storeID },
                  {
                    storeName,
                    contactAddress,
                    storeDesc,
                    storeLogo: storeLogoPath,
                    phoneContact,
                  }
                );

              if (storeInfoUpdated)
                console.log(
                  "Your store " + storeID + " info has been updated!"
                );

              //Send success back to frontend
              // res.json({ forumInfo });
            }
          }
        );
      }
    }
  } else {
    const storeInfoUpdated = await MarketStoresModel.findByIdAndUpdate(
      { _id: storeID },
      { storeName, contactAddress, storeDesc, phoneContact }
    );

    if (storeInfoUpdated)
      console.log("Your store " + storeID + " info has been updated!");
  }
});

const addProductToStore = asyncWrapper(async (req, res) => {
  const {
    storeID,
    productName,
    productPrice,
    productDesc,
    category,
    discountPrice,
    discountPercentage,
    numberOfAvailableProduct,
    freeDelivery,
  } = req.body;
  let productImgs = [];
  let uploadOk = 1;

  // const cookies = req.cookies;
  // const token = cookies.jwtAccessToken;
  // const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  // const user = {
  //   userId: payload.userId,
  //   userName: payload.userName,
  // };

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  //If any file is uploaded, proceed to upload
  if (req.files || Object.keys(req.files).length > 0) {
    //Loop through each files
    for (let i = 0; i < req.files.length; i++) {
      var productImgFile = req.files[files[i]];

      allowedFiles = productImgFile.mimetype;
      fileSize = productImgFile.size;
      maxSize = 5000000;

      //If media uploaded is an image
      if (allowedFiles && allowedFiles.startsWith("image/")) {
        if (fileSize > maxSize) {
          res.send("File is too big");
          // res.json({ fileTooBig: true });
          uploadOk = 0;
        } else {
          const productImgFileName =
            uuidv4() + "_" + productImgFile.name.split(".")[0];

          cloudinary.uploader.upload(
            productImgFile.tempFilePath,
            {
              resource_type: "image",
              public_id: `storeProductImages/${productImgFileName}`,
            },
            async function (err, logo) {
              if (err) {
                console.log(err);
                uploadOk = 0;
              } else {
                newTopicMedia = logo.secure_url;
                uploadOk = 1;

                productImgs.push(newTopicMedia);

                //Delete file from temp folder
                fs.unlinkSync(productImgFile.tempFilePath);
              }
            }
          );
        }
      }
    }
  }

  if (uploadOk == 1) {
    const productAdded = await StoreProductsModel.create({
      storeID,
      productName,
      productPrice,
      productDesc,
      productImgs,
      category,
      discount: { discountPrice, discountPercentage },
      numberOfAvailableProduct,
      freeDelivery,
    });

    if (productAdded)
      console.log(
        "Product " +
          productAdded._id +
          " with the name " +
          productName +
          " has been added to your store " +
          storeID
      );
  }
});

const updateProductInfo = asyncWrapper(async (req, res) => {
  const {
    productID,
    storeID,
    productName,
    productPrice,
    productDesc,
    category,
    discountPrice,
    discountPercentage,
    numberOfAvailableProduct,
    freeDelivery,
  } = req.body;

  if (req.files) {
    let productImgs = [];
    let uploadOk = 1;

    //If any file is uploaded, proceed to upload
    if (req.files || Object.keys(req.files).length > 0) {
      //Loop through each files
      for (let i = 0; i < req.files.length; i++) {
        var productImgFile = req.files[files[i]];

        allowedFiles = productImgFile.mimetype;
        fileSize = productImgFile.size;
        maxSize = 5000000;

        //If media uploaded is an image
        if (allowedFiles && allowedFiles.startsWith("image/")) {
          if (fileSize > maxSize) {
            res.send("File is too big");
            // res.json({ fileTooBig: true });
            uploadOk = 0;
          } else {
            const productImgFileName =
              uuidv4() + "_" + productImgFile.name.split(".")[0];

            cloudinary.uploader.upload(
              productImgFile.tempFilePath,
              {
                resource_type: "image",
                public_id: `storeProductImages/${productImgFileName}`,
              },
              async function (err, logo) {
                if (err) {
                  console.log(err);
                  uploadOk = 0;
                } else {
                  newTopicMedia = logo.secure_url;
                  uploadOk = 1;

                  productImgs.push(newTopicMedia);

                  //Delete file from temp folder
                  fs.unlinkSync(productImgFile.tempFilePath);
                }
              }
            );
          }
        }
      }
    }

    if (uploadOk == 1) {
      const productInfoUpdated = await StoreProductsModel.findByIdAndUpdate(
        { _id: productID },
        {
          storeID,
          productName,
          productPrice,
          productDesc,
          productImgs,
          category,
          discount: { discountPrice, discountPercentage },
          numberOfAvailableProduct,
          freeDelivery,
        }
      );

      if (productInfoUpdated)
        console.log("Product " + productID + " info has been updated!");
    }
  } else {
    const productInfoUpdated = await StoreProductsModel.findByIdAndUpdate(
      { _id: productID },
      {
        storeID,
        productName,
        productPrice,
        productDesc,
        productImgs,
        category,
        discount: { discountPrice, discountPercentage },
        numberOfAvailableProduct,
        freeDelivery,
      }
    );

    if (productInfoUpdated)
      console.log("Product " + productID + " info has been updated!");
  }
});

/**
 ===================================================================================================
 OPERATIONS PERFORMED AS A BUYER
 -- Add products to favourites (Done with socketIO)
 -- Add products to cart (Done with socketIO)
 -- Rate a store performance (Done with socketIO)
 -- Add and delete a product review & rating (Done with socketIO)
 -- Make an order for a product (Done with socketIO)
 ===================================================================================================
 */

module.exports = {
  marketPlace,
  singleProduct,
  createStorePage,
  createStore,
  updateStoreInfo,
  addProductToStore,
  updateProductInfo,
};
