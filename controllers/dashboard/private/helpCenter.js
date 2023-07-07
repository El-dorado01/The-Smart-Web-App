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

const helpCentre = (req, res) => {
  const page_name = req.path;
  res.status(StatusCodes.OK).render("./dashboard/private/help_centre", {
    headTitle: "Help Centre",
    page_name,
  });
};

module.exports = {
  helpCentre,
};
