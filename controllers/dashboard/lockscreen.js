const path = require("path");

require("express-async-errors");
// const AuthModel = require("../../models/AuthModel")
const asyncWrapper = require("../../middleware/async");
const { StatusCodes } = require("http-status-codes");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const lockscreen = (req, res) => {
  res
    .status(StatusCodes.OK)
    .render("./dashboard/lockscreen", { headTitle: "Lockscreen" });
};

module.exports = {
  lockscreen,
};
