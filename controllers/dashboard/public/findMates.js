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

const findMates = (req, res) => {
  const page_name = req.path;
  res.status(StatusCodes.OK).render("./dashboard/public/find_mates", {
    headTitle: "Find Mates",
    page_name,
  });
};

module.exports = {
  findMates,
};
