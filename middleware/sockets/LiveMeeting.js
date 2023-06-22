require("express-async-errors");
const asyncWrapper = require("../async");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const AuthModel = require("../../models/AuthModel");
const MeetingsModel = require("../../models/MeetingsModel");

// const showInfoAboutAMeeting = ;

const cancelAMeeting = async (roomID) => {
  const a = await MeetingsModel.findByIdAndDelete({ _id: roomID });
  if (a) console.log("Meeting cancelled");
};

// const startAMeeting = ;

// const joinAMeeting = ;

const endAMeeting = async (roomID) => {
  await MeetingsModel.findByIdAndUpdate({ _id: roomID }, { status: "end" });
};

module.exports = {
  // showInfoAboutAMeeting,
  cancelAMeeting,
  // startAMeeting,
  // joinAMeeting,
  endAMeeting,
};
