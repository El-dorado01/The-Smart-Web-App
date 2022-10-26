const path = require("path");
const express = require("express");
const app = express();

require("express-async-errors");
const bcrypt = require("bcryptjs");
const AuthModel = require("../../models/AuthModel");
const cookieParser = require("cookie-parser");
const asyncWrapper = require("../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");
const { StatusCodes } = require("http-status-codes");

app.use(cookieParser());

const login = (req, res) => {
  const cookies = req.cookies;

  if (cookies?.jwtAccessToken) {
    res.status(StatusCodes.PERMANENT_REDIRECT).redirect("/dashboard");
  } else {
    res.status(StatusCodes.OK).render("./auth/login");
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError("Please provide username and password");
  }

  const user = await AuthModel.findOne({ username });

  if (!user) {
    throw new UnauthenticatedError("Invalid username");
  }

  if (user.verificationStatus != true) {
    throw new UnauthenticatedError("Please verify your account first");
  }

  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid password");
  }

  const token = user.createAccessToken();

  const maxAge = 3 * 24 * 60 * 60 * 1000;

  res.cookie("jwtAccessToken", token, { httpOnly: true, maxAge: maxAge });
  res.status(StatusCodes.CREATED).json({ token });

  console.log("Login successful");
};

module.exports = {
  login,
  loginUser,
};
