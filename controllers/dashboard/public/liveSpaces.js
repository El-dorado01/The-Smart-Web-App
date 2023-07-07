const path = require("path");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
// const AuthModel = require("../../models/AuthModel")
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");

const liveSpaces = (req, res) => {
  const page_name = req.path;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/public/live_spaces", {
      headTitle: "Live Spaces",
      page_name,
    });
};

module.exports = {
  liveSpaces,
};
