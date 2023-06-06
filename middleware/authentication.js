const AuthModel = require("../models/AuthModel");

const jwt = require("jsonwebtoken");
const { UnauthenticatedError, ForbiddenError } = require("../errors");
const { StatusCodes } = require("http-status-codes");

const auth = async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwtAccessToken) {
    throw new UnauthenticatedError(
      "You are not authorized to access this page"
    );
  }

  const token = cookies.jwtAccessToken;

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    // attach the user token to the user dashboard
    req.user = {
      userId: payload.userId,
      userName: payload.userName,
    };
    // console.log(req.user.userId);

    let user = await AuthModel.findById(req.user.userId);

    res.locals.getURL = req.protocol + "://" + req.get("host");
    if (user.lockScreen == true) {
      res.locals.lockScreen = true;
    } else {
      res.locals.lockScreen = false;
    }
    res.locals.user = user;

    next();
  } catch (error) {
    throw new ForbiddenError("Invalid token");
  }
};

module.exports = auth;
