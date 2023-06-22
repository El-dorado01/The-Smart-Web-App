const path = require("path");

require("express-async-errors");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const AuthModel = require("../../../models/AuthModel");
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");

const profile = async (req, res) => {
  const page_name = req.path;
  const userID = req.params.profileID;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };
  let userMe = await AuthModel.findById(user.userId);
  const profile = await AuthModel.findById(userID);

  var friendsArray = [];
  const friendList = await AuthModel.findOne({
    _id: user.userId,
    "friends.status": "pending",
  });
  if (friendList != null) {
    for (let i = 0; i < friendList.friends.length; i++) {
      if (friendList.friends[i].status === "pending") {
        var a = await AuthModel.findById(
          friendList.friends[i].userID,
          "username avatar about"
        );
        friendsArray.push({ sender: friendList.friends[i].sender, details: a });
      }
    }
    function getRandomFriends(arr, num) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    }
    const friends = getRandomFriends(friendsArray, 5);

    res.locals.friends = friends;
  } else {
    res.locals.friends = "empty";
  }
  res.locals.profile = profile;

  var contactsArray = [];
  var requestsArray = [];
  var declinedArray = [];
  var blockedArray = [];
  var mayKnow = [];
  var mayKnowArray = [];
  for (let i = 0; i < userMe.friends.length; i++) {
    //Who You May Know
    var b = await AuthModel.findById(userMe.friends[i].userID, "friends");

    b.friends.forEach(async (item) => {
      if (!mayKnow.includes(item.userID)) {
        mayKnow.push(item.userID);
      }
    });

    //Case One
    if (userMe.friends[i].status === "accepted") {
      var a = await AuthModel.findById(
        userMe.friends[i].userID,
        "username avatar about"
      );
      contactsArray.push({
        sender: userMe.friends[i].sender,
        details: a,
      });
    }

    //Case Two
    if (userMe.friends[i].status === "pending") {
      var a = await AuthModel.findById(
        userMe.friends[i].userID,
        "username avatar about"
      );
      requestsArray.push({
        sender: userMe.friends[i].sender,
        details: a,
      });
    }

    //Case Three
    if (userMe.friends[i].status === "declined") {
      var a = await AuthModel.findById(
        userMe.friends[i].userID,
        "username avatar about"
      );
      declinedArray.push({
        sender: userMe.friends[i].sender,
        id: userMe.friends[i]._id,
        details: a,
      });
    }

    //Case Four
    if (
      userMe.friends[i].block === true &&
      userMe.friends[i].blocker === user.userId.toString()
    ) {
      var a = await AuthModel.findById(
        userMe.friends[i].userID,
        "username avatar about"
      );
      blockedArray.push({
        sender: userMe.friends[i].sender,
        details: a,
      });
    }
  }

  function getRandom(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }
  const mayKnowArrays = getRandom(mayKnow, 20);

  for (let i = 0; i < mayKnowArrays.length; i++) {
    var a = await AuthModel.findById(mayKnowArrays[i], "username avatar about");
    mayKnowArray.push(a);
  }

  if (contactsArray.length > 0) {
    res.locals.contactsArray = contactsArray;
  } else {
    res.locals.contactsArray = "empty";
  }
  if (requestsArray.length > 0) {
    res.locals.requestsArray = requestsArray;
  } else {
    res.locals.requestsArray = "empty";
  }
  if (declinedArray.length > 0) {
    res.locals.declinedArray = declinedArray;
  } else {
    res.locals.declinedArray = "empty";
  }
  if (blockedArray.length > 0) {
    res.locals.blockedArray = blockedArray;
  } else {
    res.locals.blockedArray = "empty";
  }
  if (mayKnowArray.length > 0) {
    res.locals.mayKnow = mayKnowArray;
  } else {
    res.locals.mayKnow = "empty";
  }
  res
    .status(StatusCodes.OK)
    .render("./dashboard/private/profile", { headTitle: "Profile", page_name });
};

module.exports = {
  profile,
};
