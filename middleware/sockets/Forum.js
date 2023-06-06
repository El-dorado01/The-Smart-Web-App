require("express-async-errors");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const AuthModel = require("../../models/AuthModel");
const ForumsActivityModel = require("../../models/ForumsActivityModel");
const ForumsModel = require("../../models/ForumsModel");
const ForumsTopicsModel = require("../../models/ForumsTopicsModel");
const UserUpvotesModel = require("../../models/UserUpvotesModel");

const deleteATopicAsModerator = async (data) => {
  const {
    moderatorID,
    forumID,
    memberID,
    topicID,
    actionType,
    reasonForDelete,
  } = data;

  //Check if user is allowed to perform this action
  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  for (let i = 0; i < forumInfo.moderators.length; i++) {
    if (
      forumInfo.moderators[i].userID == moderatorID ||
      forumOwner == moderatorID
    ) {
      switch (actionType) {
        case "deleteOnly":
          const topicDeleted = await ForumsTopicsModel.findByIdAndDelete({
            _id: topicID,
          });

          if (topicDeleted) {
            console.log(
              "Topic " + topicID + " has been deleted from the forum " + forumID
            );
          }
          break;

        default:
          //Delete a topic and warn member by default
          const topicDeleted1 = await ForumsTopicsModel.findByIdAndDelete({
            _id: topicID,
          });

          //Get the member's number of warns
          const memberWarnNumber = await ForumsModel.findOne(
            { _id: forumID, "members.userID": memberID },
            "numberOfWarns"
          );

          if (memberWarnNumber < 5) {
            const newWarnNumber = memberWarnNumber + 1;

            //Check if the new member's warn number has reached 5, then remove member
            if (newWarnNumber >= 5) {
              const memberWarned = await ForumsModel.findByIdAndUpdate(
                { _id: forumID },
                { $pull: { "members.$.userID": memberID } }
              );

              if (memberWarned) {
                console.log(
                  "User " +
                    memberID +
                    " has been sent a warning for misconduct and has been ejected from the forum."
                );
                // res.status(StatusCodes.OK).send("Request sent!");
              }
            } else {
              const memberWarned = await ForumsModel.findOneAndUpdate(
                { _id: forumID, "members.userID": memberID },
                { $set: { "members.$.numberOfWarns": newWarnNumber } }
              );

              if (memberWarned) {
                console.log(
                  "User " +
                    memberID +
                    " has been sent a warning for misconduct in the forum."
                );
                // res.status(StatusCodes.OK).send("Request sent!");
              }
            }
          } else {
            res
              .status(StatusCodes.BAD_REQUEST)
              .send("Number of warns exceeded!");
          }

          if (topicDeleted1) {
            console.log(
              "Topic " +
                topicID +
                " has been deleted from the forum " +
                forumID +
                " and member " +
                memberID +
                " has been ejected from the group!"
            );
          }
          break;
      }
    } else {
      res
        .status(StatusCodes.FORBIDDEN)
        .send("You are not allowed to perform this action");
    }
  }
};

const deleteAResponseAsModerator = async (data) => {
  const {
    moderatorID,
    forumID,
    memberID,
    topicID,
    responseID,
    actionType,
    reasonForDelete,
  } = data;

  //Check if user is allowed to perform this action
  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  for (let i = 0; i < forumInfo.moderators.length; i++) {
    if (
      forumInfo.moderators[i].userID == moderatorID ||
      forumOwner == moderatorID
    ) {
      switch (actionType) {
        case "deleteOnly":
          const responseDeleted = await ForumsTopicsModel.findByIdAndUpdate(
            { _id: topicID },
            { $pull: { responses: { responseID } } }
          );

          if (responseDeleted) {
            console.log(
              "Response " +
                responseID +
                " has been deleted from the forum " +
                forumID
            );
          }
          break;

        default:
          //Delete a response and warn member by default
          const responseDeleted1 = await ForumsTopicsModel.findByIdAndUpdate(
            { _id: topicID },
            { $pull: { responses: { responseID } } }
          );

          //Get the member's number of warns
          const memberWarnNumber = await ForumsModel.findOne(
            { _id: forumID, "members.userID": memberID },
            "numberOfWarns"
          );

          if (memberWarnNumber < 5) {
            const newWarnNumber = memberWarnNumber + 1;

            //Check if the new member's warn number has reached 5, then remove member
            if (newWarnNumber >= 5) {
              const memberWarned = await ForumsModel.findByIdAndUpdate(
                { _id: forumID },
                { $pull: { "members.$.userID": memberID } }
              );

              if (memberWarned) {
                console.log(
                  "User " +
                    memberID +
                    " has been sent a warning for misconduct and has been ejected from the forum."
                );
                // res.status(StatusCodes.OK).send("Request sent!");
              }
            } else {
              const memberWarned = await ForumsModel.findOneAndUpdate(
                { _id: forumID, "members.userID": memberID },
                { $set: { "members.$.numberOfWarns": newWarnNumber } }
              );

              if (memberWarned) {
                console.log(
                  "User " +
                    memberID +
                    " has been sent a warning for misconduct in the forum."
                );
                // res.status(StatusCodes.OK).send("Request sent!");
              }
            }
          } else {
            res
              .status(StatusCodes.BAD_REQUEST)
              .send("Number of warns exceeded!");
          }

          if (responseDeleted1) {
            console.log(
              "Response " +
                responseID +
                " has been deleted from the forum " +
                forumID +
                " and member " +
                memberID +
                " has been ejected from the group!"
            );
          }
          break;
      }
    } else {
      res
        .status(StatusCodes.FORBIDDEN)
        .send("You are not allowed to perform this action");
    }
  }
};

const updateTopicUpvotes = async (data) => {
  const { userID, topicID, forumID, actionType } = data;

  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  const getInfo = await ForumsTopicsModel.findById(
    { _id: topicID },
    "upvotes userID"
  );

  switch (actionType) {
    case "upvoteATopic":
      var newTopicUpvote = getInfo.upvotes + 1;
      const topicUpvoted = await ForumsTopicsModel.findByIdAndUpdate(
        { _id: topicID },
        { upvotes: newTopicUpvote }
      );

      let userUpvoted;
      //Check if user is the forum creator
      if (getInfo.userID == forumOwner) {
        const userUpvoteNumber = await ForumsModel.findOne(
          { _id: forumID },
          "ownerUpvotes"
        );

        var newUserUpvote = userUpvoteNumber.ownerUpvotes + 1;
        userUpvoted = await ForumsModel.findOneAndUpdate(
          { _id: forumID },
          { ownerUpvotes: newUserUpvote }
        );
      } else {
        const userUpvoteNumber = await ForumsModel.findOne(
          { _id: forumID, "members.userID": getInfo.userID },
          "upvotes"
        );

        var newUserUpvote = userUpvoteNumber.upvotes + 1;
        userUpvoted = await ForumsModel.findOneAndUpdate(
          { _id: forumID, "members.userID": getInfo.userID },
          { $set: { "members.$.upvotes": newUserUpvote } }
        );
      }
      var userUpvotePresent = await UserUpvotesModel.findOne({ userID });
      if (userUpvotePresent) {
        var upvoteAdded = await UserUpvotesModel.findOneAndUpdate(
          { userID },
          {
            $push: {
              myUpvotes: {
                upvoteType: "topic",
                forumID,
                topicID,
              },
            },
          }
        );
      } else {
        var upvoteAdded = await UserUpvotesModel.create({
          userID,
          myUpvotes: [
            {
              upvoteType: "topic",
              forumID,
              topicID,
            },
          ],
        });
      }

      const userActivity = await ForumsActivityModel.findOne({
        userID,
      });

      if (userActivity) {
        await ForumsActivityModel.findOneAndUpdate(
          { userID },
          {
            $push: {
              activities: {
                activity: "upvoteTopic",
                forumID,
                topicID,
              },
            },
          }
        );
      } else {
        const activityCreated = await ForumsActivityModel.create({
          userID,
          activities: [
            {
              activity: "upvoteTopic",
              forumID,
              topicID,
            },
          ],
        });
      }

      if (topicUpvoted && userUpvoted && upvoteAdded)
        console.log("Topic " + topicID + " has been upvoted");
      break;

    default:
      //Remove upvote from a topic by default
      var newTopicUpvote = getInfo.upvotes - 1;
      const topicUpvoteRemoved = await ForumsTopicsModel.findByIdAndUpdate(
        { _id: topicID },
        { upvotes: newTopicUpvote }
      );

      let userUpvoteRemoved;
      //Check if user is the forum creator
      if (getInfo.userID == forumOwner) {
        const userUpvoteNumber = await ForumsModel.findOne(
          { _id: forumID },
          "ownerUpvotes"
        );

        var newUserUpvote = userUpvoteNumber.ownerUpvotes - 1;
        userUpvoteRemoved = await ForumsModel.findOneAndUpdate(
          { _id: forumID },
          { ownerUpvotes: newUserUpvote }
        );
      } else {
        const userUpvoteNumber = await ForumsModel.findOne(
          { _id: forumID, "members.userID": getInfo.userID },
          "upvotes"
        );

        var newUserUpvote = userUpvoteNumber.upvotes - 1;
        userUpvoteRemoved = await ForumsModel.findOneAndUpdate(
          { _id: forumID, "members.userID": getInfo.userID },
          { $set: { "members.$.upvotes": newUserUpvote } }
        );
      }

      var userUpvotePresent = await UserUpvotesModel.findOne({ userID });
      if (userUpvotePresent) {
        var upvoteRemoved = await UserUpvotesModel.findOneAndUpdate(
          { userID },
          {
            $pull: {
              myUpvotes: {
                upvoteType: "topic",
                forumID,
                topicID,
              },
            },
          }
        );
      }

      await ForumsActivityModel.findOneAndUpdate(
        { userID },
        {
          $pull: {
            activities: {
              activity: "upvoteTopic",
              forumID,
              topicID,
            },
          },
        }
      );

      if (topicUpvoteRemoved && userUpvoteRemoved && upvoteRemoved)
        console.log("Upvote for topic " + topicID + " has been removed");
      break;
  }
};

const updateResponseUpvotes = async (data) => {
  const { userID, topicID, responseID, forumID, actionType } = data;

  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  const getAllResponses = await ForumsTopicsModel.findById(
    { _id: topicID },
    "responses"
  );

  for (let i = 0; i < getAllResponses.responses.length; i++) {
    const responses = getAllResponses.responses[i];

    if (responses._id == responseID) {
      var oldResponseUpvotes = responses.upvotes;
      switch (actionType) {
        case "upvoteAResponse":
          var newResponseUpvote = oldResponseUpvotes + 1;
          const responseUpvoted = await ForumsTopicsModel.findOneAndUpdate(
            { _id: topicID, "responses._id": responseID },
            { $set: { "responses.$.upvotes": newResponseUpvote } }
          );

          let userUpvoted;
          //Check if user is the forum creator
          if (responses.userID == forumOwner) {
            const userUpvoteNumber = await ForumsModel.findOne(
              { _id: forumID },
              "ownerUpvotes"
            );

            var newUserUpvote = userUpvoteNumber.ownerUpvotes + 1;
            userUpvoted = await ForumsModel.findOneAndUpdate(
              { _id: forumID },
              { ownerUpvotes: newUserUpvote }
            );
          } else {
            const userUpvoteNumber = await ForumsModel.findOne(
              { _id: forumID, "members.userID": responses.userID },
              "upvotes"
            );

            var newUserUpvote = userUpvoteNumber.upvotes + 1;
            userUpvoted = await ForumsModel.findOneAndUpdate(
              { _id: forumID, "members.userID": responses.userID },
              { $set: { "members.$.upvotes": newUserUpvote } }
            );
          }

          var userUpvotePresent = await UserUpvotesModel.findOne({ userID });
          if (userUpvotePresent) {
            var upvoteAdded = await UserUpvotesModel.findOneAndUpdate(
              { userID },
              {
                $push: {
                  myUpvotes: {
                    upvoteType: "response",
                    forumID,
                    topicID,
                    responseID,
                  },
                },
              }
            );
          } else {
            var upvoteAdded = await UserUpvotesModel.create({
              userID,
              myUpvotes: [
                {
                  upvoteType: "response",
                  forumID,
                  topicID,
                  responseID,
                },
              ],
            });
          }

          const userActivity = await ForumsActivityModel.findOne({
            userID,
          });

          if (userActivity) {
            await ForumsActivityModel.findOneAndUpdate(
              { userID },
              {
                $push: {
                  activities: {
                    activity: "upvoteResponse",
                    forumID,
                    topicID,
                    responseID,
                  },
                },
              }
            );
          } else {
            const activityCreated = await ForumsActivityModel.create({
              userID,
              activities: [
                {
                  activity: "upvoteResponse",
                  forumID,
                  topicID,
                  responseID,
                },
              ],
            });
          }

          if (responseUpvoted && userUpvoted && upvoteAdded)
            console.log(
              "Response " +
                responseID +
                " on a topic " +
                topicID +
                " has been upvoted"
            );
          break;

        default:
          //Remove upvote from a response by default
          var newResponseUpvote = oldResponseUpvotes - 1;
          const responseUpvoteRemoved =
            await ForumsTopicsModel.findOneAndUpdate(
              { _id: topicID, "responses._id": responseID },
              { $set: { "responses.$.upvotes": newResponseUpvote } }
            );

          let userUpvoteRemoved;
          //Check if user is the forum creator
          if (responses.userID == forumOwner) {
            const userUpvoteNumber = await ForumsModel.findOne(
              { _id: forumID },
              "ownerUpvotes"
            );

            var newUserUpvote = userUpvoteNumber.ownerUpvotes - 1;
            userUpvoteRemoved = await ForumsModel.findOneAndUpdate(
              { _id: forumID },
              { ownerUpvotes: newUserUpvote }
            );
          } else {
            const userUpvoteNumber = await ForumsModel.findOne(
              { _id: forumID, "members.userID": responses.userID },
              "upvotes"
            );

            var newUserUpvote = userUpvoteNumber.upvotes - 1;
            userUpvoteRemoved = await ForumsModel.findOneAndUpdate(
              { _id: forumID, "members.userID": responses.userID },
              { $set: { "members.$.upvotes": newUserUpvote } }
            );
          }

          var userUpvotePresent = await UserUpvotesModel.findOne({ userID });
          if (userUpvotePresent) {
            var upvoteRemoved = await UserUpvotesModel.findOneAndUpdate(
              { userID },
              {
                $pull: {
                  myUpvotes: {
                    upvoteType: "response",
                    forumID,
                    topicID,
                    responseID,
                  },
                },
              }
            );
          }

          await ForumsActivityModel.findOneAndUpdate(
            { userID },
            {
              $pull: {
                activities: {
                  activity: "upvoteResponse",
                  forumID,
                  topicID,
                  responseID,
                },
              },
            }
          );

          if (responseUpvoteRemoved && userUpvoteRemoved && upvoteRemoved)
            console.log(
              "Upvote of a response " +
                responseID +
                " on a topic " +
                topicID +
                " has been removed!"
            );
          break;
      }
    }
  }
};

const updateTopicBookmarks = async (data) => {
  const { userID, topicID, forumID, actionType } = data;

  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  const getInfo = await ForumsTopicsModel.findById(
    { _id: topicID },
    "bookmarks userID"
  );

  switch (actionType) {
    case "bookmarkATopic":
      const topicBookmarked = await ForumsTopicsModel.findByIdAndUpdate(
        { _id: topicID },
        { $push: { bookmarks: { userID } } }
      );

      const userActivity = await ForumsActivityModel.findOne({
        userID,
      });

      if (userActivity) {
        await ForumsActivityModel.findOneAndUpdate(
          { userID },
          {
            $push: {
              activities: {
                activity: "bookmark",
                forumID,
                topicID,
              },
            },
          }
        );
      } else {
        const activityCreated = await ForumsActivityModel.create({
          userID,
          activities: [
            {
              activity: "bookmark",
              forumID,
              topicID,
            },
          ],
        });
      }

      if (topicBookmarked)
        console.log("Topic " + topicID + " has been added to bookmarks");
      break;

    default:
      //Remove topic from bookmarks by default
      const topicBookmarkRemoved = await ForumsTopicsModel.findByIdAndUpdate(
        { _id: topicID },
        { $pull: { bookmarks: { userID } } }
      );

      await ForumsActivityModel.findOneAndUpdate(
        { userID },
        {
          $pull: {
            activities: {
              activity: "bookmark",
              forumID,
              topicID,
            },
          },
        }
      );

      if (topicBookmarkRemoved)
        console.log("Topic " + topicID + " has been removed from bookmarks");
      break;
  }
};

module.exports = {
  deleteATopicAsModerator,
  deleteAResponseAsModerator,
  updateTopicUpvotes,
  updateResponseUpvotes,
  updateTopicBookmarks,
};
