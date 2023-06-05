require("express-async-errors");
const asyncWrapper = require("../async");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const AuthModel = require("../../models/AuthModel");

module.exports = {};
