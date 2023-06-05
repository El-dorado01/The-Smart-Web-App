require("express-async-errors");
const asyncWrapper = require("../async");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const AuthModel = require("../../models/AuthModel");

const lockScreen = async (userID) => {
  await AuthModel.findOneAndUpdate({ _id: userID }, { lockScreen: true });
};

// const unlockScreen = ;

module.exports = {
  lockScreen,
  // unlockScreen,
};
