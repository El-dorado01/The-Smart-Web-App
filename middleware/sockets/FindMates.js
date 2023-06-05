require("express-async-errors");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const AuthModel = require("../../models/AuthModel");
const FindMatesModel = require("../../models/FindMatesModel");

const updateAccountStatus = async (data) => {
  const { profileID, actionType } = data;

  switch (actionType) {
    case "activateAccount":
      const accountActivated = await FindMatesModel.findByIdAndUpdate(
        { profileID },
        { accountStatus: true }
      );

      if (accountActivated)
        console.log("Profile " + profileID + " has been activated!");
      break;

    default:
      //Deactivate an account by default
      const accountDeactivated = await FindMatesModel.findByIdAndUpdate(
        { profileID },
        { accountStatus: false }
      );

      if (accountDeactivated)
        console.log("Profile " + profileID + " has been deactivated!");
      break;
  }
};

const removeMatesFromSuggestion = async (data) => {
  const { profileID, mateProfileID } = data;
  const matesRemovedFromSuggestion = await FindMatesModel.findByIdAndUpdate(
    { _id: profileID },
    { $push: { removeMatesFromSuggestion: { userID: mateProfileID } } }
  );

  if (matesRemovedFromSuggestion)
    console.log("Mate " + mateID + " has been removed from your suggestion!");
};

const updateMatchRequests = async (data) => {
  const { profileID, mateProfileID, actionType } = data;

  switch (actionType) {
    case "sendAMatch":
      const matchSent = await FindMatesModel.findOneAndUpdate(
        { _id: mateProfileID },
        { $push: { mateMatchRequests: { userID: profileID } } }
      );

      if (matchSent)
        console.log(
          "Mate " + mateProfileID + " has been sent a match request!"
        );
      break;

    case "deleteAMatchAfter24hrs":
      const matchDeleted = await FindMatesModel.findOneAndUpdate(
        { _id: profileID },
        { $pull: { mateMatchRequests: { userID: mateProfileID } } }
      );

      if (matchDeleted)
        console.log("Match Request has been deleted after 24 hrs!");
      break;

    default:
      //Accept mate's match request

      //Update user's profile
      const matchAcceptedForUser = await FindMatesModel.findByIdAndUpdate(
        { _id: profileID },
        { $push: { matchedMates: { userID: mateProfileID } } }
      );

      //Update Mate's profile
      const matchAcceptedForMate = await FindMatesModel.findByIdAndUpdate(
        { _id: mateProfileID },
        { $push: { matchedMates: { userID: mateID } } }
      );

      if (matchAcceptedForUser && matchAcceptedForMate)
        console.log(
          "It's a match! You are now matched up with mate " + mateProfileID
        );
      break;
  }
};

const getUserLocation = async (data) => {
  const { profileID, userLat, userLong } = data;
  const locationGotten = await FindMatesModel.findByIdAndUpdate(
    { _id: profileID },
    {
      lastSeenLatitude: userLat,
      lastSeenLongitude: userLong,
    }
  );

  if (locationGotten)
    console.log(
      "User with profile " + profileID + " location has been gotten!"
    );
};

module.exports = {
  updateAccountStatus,
  removeMatesFromSuggestion,
  updateMatchRequests,
  getUserLocation,
};
