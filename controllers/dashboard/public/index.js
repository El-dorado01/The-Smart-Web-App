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

const homePage = (req, res) => {
  const page_name = req.path;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/public/index", { headTitle: "Feeds", page_name });
};

const singlePost = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  res.status(StatusCodes.OK).render("./dashboard/public/feed_single", {
    headTitle: "Feeds",
    page_name,
  });
});

module.exports = {
  homePage,
  singlePost,
};
