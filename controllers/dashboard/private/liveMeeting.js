const path = require("path");
const fs = require("fs");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const MoviesModel = require("../../../models/MeetingsModel");
const asyncWrapper = require("../../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");
const MeetingsModel = require("../../../models/MeetingsModel");
const AuthModel = require("../../../models/AuthModel");

const liveMeeting = asyncWrapper(async (req, res) => {
  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const meetings = await MeetingsModel.find({
    Host: user.userId,
    $or: [{ status: "upcoming" }, { status: "start" }],
  });

  if (meetings.length === 0) {
    res.locals.meetings = false;
  } else {
    res.locals.meetings = meetings;
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

  res.status(StatusCodes.OK).render("./dashboard/private/live_meetings", {
    headTitle: "Live Meetings",
    page_name,
  });
});

const room = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const roomID = req.params.roomID;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

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

  const meetings = await MeetingsModel.find({
    Host: user.userId,
    $or: [{ status: "upcoming" }, { status: "start" }],
  });

  if (roomID == "roomFull") {
    if (meetings.length === 0) {
      res.locals.meetings = false;
    } else {
      res.locals.meetings = meetings;
    }

    res.status(StatusCodes.OK).render("./dashboard/private/upcoming_meeting", {
      headTitle: "Live Meetings",
      page_name,
      headMsg: "room_full",
    });
  } else {
    try {
      const roomDetails = await MeetingsModel.findById({ _id: roomID });
      if (!roomDetails) {
        throw new Error("error");
      }
      //Check if a room with the ID does not exist
      else if (roomDetails === null) {
        res
          .status(StatusCodes.NOT_FOUND)
          .sendFile(path.join(__dirname, "../../../public/", "404.html"));
      } else {
        if (roomDetails.status === "end") {
          if (meetings.length === 0) {
            res.locals.meetings = false;
          } else {
            res.locals.meetings = meetings;
          }

          res
            .status(StatusCodes.OK)
            .render("./dashboard/private/upcoming_meeting", {
              headTitle: "Live Meetings",
              page_name,
              headMsg: "end",
            });
        }
        if (roomDetails.status === "upcoming") {
          if (meetings.length === 0) {
            res.locals.meetings = false;
          } else {
            res.locals.meetings = meetings;
          }

          res
            .status(StatusCodes.OK)
            .render("./dashboard/private/upcoming_meeting", {
              headTitle: "Live Meetings",
              page_name,
              headMsg: "upcoming",
            });
        }
        if (roomDetails.status === "start") {
          console.log("User Connected: " + user.userId);
          res.locals.roomDetails = roomDetails;
          res
            .status(StatusCodes.OK)
            .render("./dashboard/private/live_meetings_room", {
              headTitle: "Live Meetings",
              page_name,
            });
        }
      }
    } catch (error) {
      res
        .status(StatusCodes.NOT_FOUND)
        .sendFile(path.join(__dirname, "../../../public/", "404.html"));
    }
  }
});

const createMeeting = asyncWrapper(async (req, res) => {
  const { roomName, roomDate, roomTime, roomCapacity, Host } = req.body;
  await MeetingsModel.create({
    roomName,
    roomDate,
    roomTime,
    roomCapacity,
    Host,
  });

  const meeting = await MeetingsModel.find({ Host });

  res.json({ meeting });
});

module.exports = {
  liveMeeting,
  room,
  createMeeting,
};
