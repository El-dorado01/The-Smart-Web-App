require("express-async-errors");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const AuthModel = require("../../models/AuthModel");

const sendAFriendRequest = async (response) => {
  var obj = {
    userID: response.friendID,
    status: "pending",
    sender: response.userID,
  };
  var obj2 = {
    userID: response.userID,
    status: "pending",
    sender: response.userID,
  };

  var a = await AuthModel.findOne({
    _id: response.userID,
    "friends.userID": response.friendID,
  });

  if (a != null) {
    await AuthModel.findOneAndUpdate(
      { _id: response.userID, "friends.userID": response.friendID },
      { $set: { "friends.$.status": "pending" } }
    );
    await AuthModel.findOneAndUpdate(
      { _id: response.friendID, "friends.userID": response.userID },
      { $set: { "friends.$.status": "pending" } }
    );
  } else {
    //Update Sender's friend list
    await AuthModel.findByIdAndUpdate(response.userID, {
      $push: { friends: obj },
    });

    //Update Receipient's friend list
    await AuthModel.findByIdAndUpdate(response.friendID, {
      $push: { friends: obj2 },
    });
  }

  console.log("Request Sent");
};

const cancelASentRequest = async (response) => {
  var obj = {
    userID: response.friendID,
  };
  var obj2 = {
    userID: response.userID,
  };
  //Update Sender's friend list
  await AuthModel.findByIdAndUpdate(response.userID, {
    $pull: { friends: obj },
  });

  //Update Receipient's friend list
  await AuthModel.findByIdAndUpdate(response.friendID, {
    $pull: { friends: obj2 },
  });

  console.log("Request Cancelled");
};

const acceptAFriendRequest = async (response) => {
  var a = await AuthModel.findOneAndUpdate(
    { _id: response.userID, "friends.userID": response.id },
    { $set: { "friends.$.status": "accepted" } }
  );
  var b = await AuthModel.findOneAndUpdate(
    { _id: response.id, "friends.userID": response.userID },
    { $set: { "friends.$.status": "accepted" } }
  );
  if (a && b) console.log("Request accepted");
};

const declineAFriendRequest = async (response) => {
  var a = await AuthModel.findOneAndUpdate(
    { _id: response.userID, "friends.userID": response.id },
    { $set: { "friends.$.status": "declined" } }
  );
  var b = await AuthModel.findOneAndUpdate(
    { _id: response.id, "friends.userID": response.userID },
    { $set: { "friends.$.status": "declined" } }
  );
  if (a && b) console.log("Request declined");
};

const deleteDeclinedRequests = async (response) => {
  var obj = {
    userID: response.friendID,
  };
  var obj2 = {
    userID: response.userID,
  };
  //Update Sender's friend list
  await AuthModel.findByIdAndUpdate(response.userID, {
    $pull: { friends: obj },
  });

  //Update Reciepient's friend list
  await AuthModel.findByIdAndUpdate(response.friendID, {
    $pull: { friends: obj2 },
  });

  console.log("Declined Request Deleted");
};

const blockAUser = async (response) => {
  await AuthModel.findOneAndUpdate(
    { _id: response.userID, "friends.userID": response.friendID },
    {
      $set: { "friends.$.block": true, "friends.$.blocker": response.userID },
    }
  );
  await AuthModel.findOneAndUpdate(
    { _id: response.friendID, "friends.userID": response.userID },
    { $set: { "friends.$.block": true } }
  );

  console.log("User blocked");
};

const unblockAUser = async (response) => {
  await AuthModel.findOneAndUpdate(
    { _id: response.userID, "friends.userID": response.friendID },
    { $set: { "friends.$.block": false } }
  );
  await AuthModel.findOneAndUpdate(
    { _id: response.friendID, "friends.userID": response.userID },
    { $set: { "friends.$.block": false } }
  );

  console.log("User unblocked");
};

// const loadContactsAndFriends = ;

module.exports = {
  sendAFriendRequest,
  cancelASentRequest,
  acceptAFriendRequest,
  declineAFriendRequest,
  deleteDeclinedRequests,
  blockAUser,
  unblockAUser,
  // loadContactsAndFriends,
};
