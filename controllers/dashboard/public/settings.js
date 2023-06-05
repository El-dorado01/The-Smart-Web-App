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

const settingsForm = (req, res) => {
  const page_name = req.path;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/public/settings", {
      headTitle: "Settings",
      page_name,
    });
};

module.exports = {
  settingsForm,
};
