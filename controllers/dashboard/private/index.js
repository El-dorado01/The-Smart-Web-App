const path = require("path");

require("express-async-errors");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const AuthModel = require("../../../models/AuthModel");
const UserchatsModel = require("../../../models/UserchatsModel");
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");

const homePage = async (req, res) => {
  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const chatRooms = await UserchatsModel.find({
    $or: [{ initiator: user.userId }, { member: user.userId }],
  });

  var newChatRoomArray = [];

  for (var i = 0; i < chatRooms.length; i++) {
    if (chatRooms[i].initiator === user.userId) {
      var userDetails = await AuthModel.findById({ _id: chatRooms[i].member });
      newChatRoomArray.push({ chatRoom: chatRooms[i], chatWith: userDetails });
    } else if (chatRooms[i].member === user.userId) {
      var userDetails = await AuthModel.findById({
        _id: chatRooms[i].initiator,
      });
      newChatRoomArray.push({ chatRoom: chatRooms[i], chatWith: userDetails });
    }
  }

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

  res.locals.messages = newChatRoomArray;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/private/index", { headTitle: "Chats", page_name });
};

module.exports = {
  homePage,
};
