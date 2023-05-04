const path = require("path");
const fs = require("fs");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");
const AuthModel = require("../../../models/AuthModel");
const ForumsModel = require("../../../models/ForumsModel");
const ForumsTopicsModel = require("../../../models/ForumsTopicsModel");
const ForumRankingsModel = require("../../../models/ForumRankingsModel");
const ForumsActivityModel = require("../../../models/ForumsActivityModel");
const { log } = require("console");

const forums = async (req, res) => {
  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Fetch User's forums
  const fetchAllForums = await ForumsModel.find({
    $or: [{ creator: user.userId }, { "members.userID": user.userId }],
  });

  const invites = await ForumsModel.find({
    $and: [{ "invites.userID": user.userId }, { "invites.incoming": false }],
  });

  //Fetch Suggested Forums

  res.locals.forums = fetchAllForums;
  res.locals.invites = invites;
  res.status(StatusCodes.OK).render("./dashboard/public/forums/forums", {
    headTitle: "Smart Forums",
    page_name,
  });
};

const singleForum = async (req, res) => {
  const page_name = req.path;
  const forumID = req.params.forumID;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Fetch User's forums
  const fetchAllForums = await ForumsModel.find({
    $or: [{ creator: user.userId }, { "members.userID": user.userId }],
  });
  const invites = await ForumsModel.find({
    $and: [{ "invites.userID": user.userId }, { "invites.incoming": false }],
  });

  const topics = [];

  const allTopics = await ForumsTopicsModel.find({ forumID }).sort(
    "-createdAt"
  );
  var topic_per_page = 1;
  var topicsModel = allTopics.slice(0, topic_per_page);
  var totalPages = Math.ceil(allTopics.length / topic_per_page);

  const forumMembers = await ForumsModel.findById(
    forumID,
    "creator members ownerUpvotes"
  );
  for (let i = 0; i < topicsModel.length; i++) {
    const userInfo = await AuthModel.findById(
      topicsModel[i].userID,
      "username avatar about"
    );
    if (topicsModel[i].userID == forumMembers.creator) {
      topics.push({
        topic: topicsModel[i],
        userInfo,
        memberUpvotes: forumMembers.ownerUpvotes,
      });
    } else {
      for (let i = 0; i < forumMembers.members.length; i++) {
        const member = forumMembers.members[i];

        if (topicsModel[i].userID == member.userID) {
          topics.push({
            topic: topicsModel[i],
            userInfo,
            memberUpvotes: member.upvotes,
          });
        }
      }
    }
  }

  res.locals.forums = fetchAllForums;
  res.locals.invites = invites;
  res.locals.forumID = forumID;
  res.locals.topics = topics;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/public/forums/single_forum_page", {
      headTitle: "Smart Forums",
      page_name,
      totalPages,
    });
};

const forumTopicInfo = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const forumID = req.params.forumID;
  const topicID = req.query.topicID;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const topicInfo = await ForumsTopicsModel.findById({ _id: topicID });
  const topicResponses = topicInfo.responses;

  const responses = [];
  let questionnaire;

  const forumInfo = await ForumsModel.findById({ _id: forumID });
  // const forumMembers = await ForumsModel.findById(
  //   forumID,
  //   "creator members ownerUpvotes"
  // );

  // Get Questionnaire's info and upvotes
  const userInfo = await AuthModel.findById(
    topicInfo.userID,
    "username avatar about"
  );

  if (topicInfo.userID == forumInfo.creator) {
    questionnaire = {
      userInfo,
      memberUpvotes: forumInfo.ownerUpvotes,
    };
  } else {
    for (let i = 0; i < forumInfo.members.length; i++) {
      const member = forumInfo.members[i];

      if (topicInfo.userID == member.userID) {
        questionnaire = {
          userInfo,
          memberUpvotes: member.upvotes,
        };
      }
    }
  }

  // Get all responses with user info and upvotes
  for (let i = 0; i < topicResponses.length; i++) {
    const response = topicResponses[i];
    const userInfo = await AuthModel.findById(
      response.userID,
      "username avatar about"
    );
    if (response.userID == forumInfo.creator) {
      responses.push({
        response,
        userInfo,
        memberUpvotes: forumInfo.ownerUpvotes,
      });
    } else {
      for (let i = 0; i < forumInfo.members.length; i++) {
        const member = forumInfo.members[i];

        if (response.userID == member.userID) {
          responses.push({
            response,
            userInfo,
            memberUpvotes: member.upvotes,
          });
        }
      }
    }
  }

  //Fetch User's forums
  const fetchAllForums = await ForumsModel.find({
    $or: [{ creator: user.userId }, { "members.userID": user.userId }],
  });
  // Fetch user's forum invites
  const invites = await ForumsModel.find({
    $and: [{ "invites.userID": user.userId }, { "invites.incoming": false }],
  });

  res.locals.forumID = forumID;
  res.locals.forumInfo = forumInfo;
  res.locals.topicInfo = topicInfo;
  res.locals.questionnaire = questionnaire;
  res.locals.responses = responses;
  res.locals.forums = fetchAllForums;
  res.locals.invites = invites;

  res.status(StatusCodes.OK).render("./dashboard/public/forums/topic_page", {
    headTitle: "Forum - " + forumInfo.forumName,
    page_name,
  });

  // res
  //   .status(StatusCodes.PERMANENT_REDIRECT)
  //   .redirect("/dashboard/public/forum/channel");
});

/*
===================================================================================================
SPECIAL OPERATIONS PERFORMED AS A FORUM CREATOR
-- Create a forum
-- Assign Moderators
-- Delete a forum
===================================================================================================
*/
const createForum = asyncWrapper(async (req, res) => {
  const { forumName, forumDesc } = req.body;
  const { displayPic } = req.files;
  let allowedFiles, fileSize, maxSize;

  // console.log(req.body, req.files.displayPic);

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, msg: "No files were uploaded." });
  }

  allowedFiles = displayPic.mimetype;
  fileSize = displayPic.size;
  maxSize = 6000000;

  if (allowedFiles && allowedFiles.startsWith("image/")) {
    if (fileSize > maxSize) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: "File is too big" });
      uploadOk = 0;
    } else {
      const displayPicName = uuidv4() + "_" + displayPic.name.split(".")[0];

      cloudinary.uploader.upload(
        displayPic.tempFilePath,
        {
          resource_type: "image",
          public_id: `forumDisplayPics/${displayPicName}`,
        },
        async function (err, logo) {
          if (err) {
            // res
            //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
            //   .json({ success: false, mgs: err.msg });
            console.log(err);
            uploadOk = 0;
          } else {
            logoPath = logo.secure_url;
            uploadOk = 1;

            const forumInfo = await ForumsModel.create({
              creator: user.userId,
              forumName,
              forumDesc,
              displayPic: logoPath,
            });

            //Create Forum Ranking System
            await ForumRankingsModel.create({
              forumID: forumInfo._id,
            });
            console.log(
              "User " + user.userId + "has created a forum called " + forumName
            );

            //Delete file from temp folder
            fs.unlinkSync(displayPic.tempFilePath);

            //Send success back to frontend
            res.status(StatusCodes.OK).json({
              success: true,
              msg: "Your forum has been created, setting up your forum...",
              forumInfo,
            });
          }
        }
      );
    }
  } else {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, msg: "This file type is not allowed" });
  }
});

const modifyModerators = asyncWrapper(async (req, res) => {
  const { forumID, memberID, actionType } = req.body;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const forumInfo = await ForumsModel.findById({ _id: forumID });

  //Check if user is the forum creator
  if (forumInfo.creator == user.userId) {
    switch (actionType) {
      case "assignModerators":
        const moderatorAssigned = await ForumsModel.findByIdAndUpdate(
          { _id: forumID },
          { $push: { moderators: { userID: memberID } } }
        );

        if (moderatorAssigned) {
          console.log(
            "Member " + memberID + " is now a moderator in the forum."
          );
          // res.status(StatusCodes.OK).send("Request approved!");
        }
        break;

      default:
        //Eject a moderator by default
        const moderatorEjected = await ForumsModel.findByIdAndUpdate(
          { _id: forumID },
          { $pull: { moderators: { userID: memberID } } }
        );

        if (moderatorEjected) {
          console.log(
            "Member " +
              memberID +
              " has been ejected as a moderator in the forum."
          );
          // res.status(StatusCodes.OK).send("Request approved!");
        }
        break;
    }
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .send("You are not allowed to perform this action");
  }
});

const updateForumRanks = asyncWrapper(async (req, res) => {
  const {
    forumID,
    newbie,
    rookie,
    apprentice,
    explorer,
    contributor,
    enthusiast,
    collaborator,
    communityRegular,
    risingStar,
    proficient,
    experienced,
    mentor,
    veteran,
    master,
    grandmaster,
    legendary,
  } = req.body;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Check if user is allowed to perform this action
  const forumInfo = await ForumsModel.findById({ _id: forumID });

  //Check if user is the forum creator
  if (forumInfo.creator == user.userId) {
    const ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
      { _id: forumID },
      {
        newbie: {
          rankName: newbie.rankName,
          minUpvotesRequired: newbie.minUpvotesRequired,
        },
        rookie: {
          rankName: rookie.rankName,
          minUpvotesRequired: rookie.minUpvotesRequired,
        },
        apprentice: {
          rankName: apprentice.rankName,
          minUpvotesRequired: apprentice.minUpvotesRequired,
        },
        explorer: {
          rankName: explorer.rankName,
          minUpvotesRequired: explorer.minUpvotesRequired,
        },
        contributor: {
          rankName: contributor.rankName,
          minUpvotesRequired: contributor.minUpvotesRequired,
        },
        enthusiast: {
          rankName: enthusiast.rankName,
          minUpvotesRequired: enthusiast.minUpvotesRequired,
        },
        collaborator: {
          rankName: collaborator.rankName,
          minUpvotesRequired: collaborator.minUpvotesRequired,
        },
        communityRegular: {
          rankName: communityRegular.rankName,
          minUpvotesRequired: communityRegular.minUpvotesRequired,
        },
        risingStar: {
          rankName: risingStar.rankName,
          minUpvotesRequired: risingStar.minUpvotesRequired,
        },
        proficient: {
          rankName: proficient.rankName,
          minUpvotesRequired: proficient.minUpvotesRequired,
        },
        experienced: {
          rankName: experienced.rankName,
          minUpvotesRequired: experienced.minUpvotesRequired,
        },
        mentor: {
          rankName: mentor.rankName,
          minUpvotesRequired: mentor.minUpvotesRequired,
        },
        veteran: {
          rankName: veteran.rankName,
          minUpvotesRequired: veteran.minUpvotesRequired,
        },
        master: {
          rankName: master.rankName,
          minUpvotesRequired: master.minUpvotesRequired,
        },
        grandmaster: {
          rankName: grandmaster.rankName,
          minUpvotesRequired: grandmaster.minUpvotesRequired,
        },
        legendary: {
          rankName: legendary.rankName,
          minUpvotesRequired: legendary.minUpvotesRequired,
        },
      }
    );

    if (ranksUpdated)
      console.log("Forum " + forumID + " 's rank system has been updated");
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .send("You are not allowed to perform this action");
  }
});

const deleteForum = asyncWrapper(async (req, res) => {
  const { forumID } = req.body;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const forumInfo = await ForumsModel.findById({ _id: forumID });

  //Check if user is the forum creator
  if (forumInfo.creator == user.userId) {
    const forumDeleted = await ForumsModel.findByIdAndDelete({ _id: forumID });
    const forumTopicsDeleted = await ForumsTopicsModel.findByOneAndDelete({
      forumID,
    });
    const forumRankingsDeleted = await ForumRankingsModel.findByOneAndDelete({
      forumID,
    });

    //Redirect to all forums page after delete
    if (forumDeleted && forumTopicsDeleted && forumRankingsDeleted) {
      res
        .status(StatusCodes.PERMANENT_REDIRECT)
        .redirect("/dashboard/public/forums");
    }
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "You are not allowed to perform this action because you didn't create this forum!"
      );
  }
});

/*
====================================================================================================
SPECIAL OPERATIONS PERFORMED AS A FORUM MODERATOR
-- Update forum profile
-- Approve new requests to join the forum
-- Send invites to new members
-- Eject members
-- Warn members
-- Delete a topic (Done with socketIO)
====================================================================================================
*/
const updateForumDisplayPic = asyncWrapper(async (req, res) => {
  const { displayPic } = req.files;

  let newPicPath;
  let uploadOk = 1;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  allowedLogoFiles = displayPic.mimetype;
  logoFileSize = req.files.displayPic.size;
  maxSize = 5000000;

  if (allowedLogoFiles && allowedLogoFiles.startsWith("image/")) {
    if (logoFileSize > maxSize) {
      res.json({ bigFile: true });
      uploadOk = 0;
    } else {
      const displayPicName = uuidv4() + "_" + displayPic.name.split(".")[0];

      cloudinary.uploader.upload(
        displayPic.tempFilePath,
        {
          resource_type: "image",
          public_id: `forumDisplayPics/${displayPicName}`,
        },
        async function (err, logo) {
          if (err) {
            console.log(err);
            uploadOk = 0;
          } else {
            newPicPath = logo.secure_url;
            uploadOk = 1;

            const forumInfo = await ForumsModel.findOneAndUpdate(
              { _id: req.body.forumID },
              {
                displayPic: newPicPath,
              }
            );
            console.log(
              "Forum " +
                req.body.forumID +
                " 's display picture has been updated."
            );

            fs.unlinkSync(displayPic.tempFilePath);
          }
        }
      );
    }
  }
});

const updateForumProfile = asyncWrapper(async (req, res) => {
  const { forumID, forumName, forumDesc, lookUpValue, wordsFilter } = req.body;

  if (lookUpValue == "on") {
    var availableForLookUp = true;
  } else {
    var availableForLookUp = false;
  }
  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Check if user is allowed to perform this action
  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  for (let i = 0; i < forumInfo.moderators.length; i++) {
    if (
      forumInfo.moderators[i].userID == user.userId ||
      forumOwner == user.userId
    ) {
      const updateInfo = {
        forumName,
        forumDesc,
        availableForLookUp,
        wordsFilter,
      };

      const infoUpdated = await ForumsModel.findByIdAndUpdate(
        { _id: forumID },
        updateInfo
      );

      if (infoUpdated) {
        console.log("Forum " + forumID + " Profile has been updated");
      }
    } else {
      res
        .status(StatusCodes.FORBIDDEN)
        .send("You are not allowed to perform this action");
    }
  }
});

const performActionAsModerator = asyncWrapper(async (req, res) => {
  const { memberID, forumID, actionType } = req.body;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Check if user is allowed to perform this action
  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  for (let i = 0; i < forumInfo.moderators.length; i++) {
    if (
      forumInfo.moderators[i].userID == user.userId ||
      forumOwner == user.userId
    ) {
      //Switch Actions
      switch (actionType) {
        case "approveRequest":
          const pullRequest = await ForumsModel.findByIdAndUpdate(
            { _id: forumID },
            { $pull: { invites: { userID: memberID } } }
          );

          let memberHasJoinedBefore = false;
          //Check if user exists as a member or a creator
          for (let i = 0; i < forumInfo.members.length; i++) {
            if (
              forumInfo.members[i].userID == memberID ||
              forumOwner == memberID
            ) {
              memberHasJoinedBefore = true;
            }
          }

          if (memberHasJoinedBefore == false) {
            const requestApproved = await ForumsModel.findByIdAndUpdate(
              { _id: forumID },
              { $push: { members: { userID: memberID } } }
            );
          } else {
            const requestApproved = await ForumsModel.findOneAndUpdate(
              { _id: forumID, "member.userID": memberID },
              { $set: { "members.$.memberStatus": "active" } }
            );
          }

          if (pullRequest && requestApproved) {
            console.log(
              "Member " + memberID + " request to join the forum has approved."
            );
            // res.status(StatusCodes.OK).send("Request approved!");
          }
          break;

        case "sendInvite":
          let memberExist = false;
          //Check if user exists as a member or a creator
          for (let i = 0; i < forumInfo.members.length; i++) {
            if (
              forumInfo.members[i].userID == memberID ||
              forumOwner == memberID
            ) {
              memberExist = true;
            }
          }

          if (memberExist == false) {
            const inviteSent = await ForumsModel.findByIdAndUpdate(
              { _id: forumID },
              { $push: { invites: { incoming: false, userID: memberID } } }
            );

            if (inviteSent) {
              console.log(
                "User " +
                  memberID +
                  " has been sent a request to join the forum."
              );
              // res.status(StatusCodes.OK).send("Request sent!");
            }
          } else {
            //User is in this forum already
            res
              .status(StatusCodes.BAD_REQUEST)
              .send("User " + memberID + " is in this forum already!");
          }
          break;

        case "warnMembers":
          //Get the member's number of warns
          const memberWarnNumber = await ForumsModel.findOne(
            { _id: forumID, "members.userID": memberID },
            "numberOfWarns"
          );

          if (memberWarnNumber < 5) {
            const newWarnNumber = memberWarnNumber + 1;

            //Check if the new member's warn number has reached 5, then remove member
            if (newWarnNumber >= 5) {
              const memberWarned = await ForumsModel.findOneAndUpdate(
                { _id: forumID, "member.userID": memberID },
                { $set: { "members.$.memberStatus": "inactive" } }
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
          break;
        // case "updateForumProfile":
        //   break;
        default:
          //Eject Members by default
          const memberEjected = await ForumsModel.findOneAndUpdate(
            { _id: forumID, "member.userID": memberID },
            { $set: { "members.$.memberStatus": "inactive" } }
          );

          if (memberEjected) {
            console.log(
              "User " + memberID + " has been ejected from the forum."
            );
            // res.status(StatusCodes.OK).send("Request sent!");
          }
          break;
      }
    } else {
      res
        .status(StatusCodes.FORBIDDEN)
        .send("You are not allowed to perform this action");
    }
  }
});

/*
====================================================================================================
SPECIAL OPERATIONS PERFORMED AS A FORUM MEMBER
-- Send requests to join a forum
-- Accept or reject invites to join a forum
-- Create a post/discussion
-- Respond to a post
-- Delete a topic or response
-- Upvote a topic or response (Done with SocketIO)
-- Bookmark a topic/discussion (Done with SocketIO)
-- Visit Member Profile
-- Exit forum
====================================================================================================
*/

const updateForumInvites = asyncWrapper(async (req, res) => {
  const { forumID, actionType } = req.body;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  switch (actionType) {
    case "sendRequestToJoin":
      const requestSent = await ForumsModel.findByIdAndUpdate(
        { _id: forumID },
        { $push: { invites: { incoming: true, userID: user.userId } } }
      );

      if (requestSent) {
        console.log(
          "You " + user.userId + " have sent a request to join forum " + forumID
        );
        // res.status(StatusCodes.OK).send("Request sent!");
      }
      break;
    case "acceptInvites":
      let memberExist = false;
      const forumInfo = await ForumsModel.findById({ _id: forumID });
      const forumOwner = forumInfo.creator;

      //Check if user exists as a member or a creator
      for (let i = 0; i < forumInfo.members.length; i++) {
        if (
          forumInfo.members[i].userID == user.userId ||
          forumOwner == user.userId
        ) {
          memberExist = true;
        }
      }

      if (memberExist == false) {
        const pullRequest = await ForumsModel.findByIdAndUpdate(
          { _id: forumID },
          { $pull: { invites: { userID: user.userId } } }
        );

        const inviteAccepted = await ForumsModel.findByIdAndUpdate(
          { _id: forumID },
          { $push: { members: { userID: user.userId } } }
        );

        if (pullRequest && inviteAccepted) {
          console.log(
            "You " +
              user.userId +
              " have accepted the invite to join forum " +
              forumID
          );
          // res.status(StatusCodes.OK).send("Request approved!");
        }
      } else {
        //You are in this forum already
        res
          .status(StatusCodes.BAD_REQUEST)
          .send("You are in this forum already!");
      }
      break;
    case "rejectInvites":
      const pullRequest = await ForumsModel.findByIdAndUpdate(
        { _id: forumID },
        { $pull: { invites: { userID: user.userId } } }
      );

      if (pullRequest) {
        console.log("You have turned down the invite to join forum " + forumID);
        // res.status(StatusCodes.OK).send("Request approved!");
      }
      break;

    default:
      //Exit forum by default
      const memberExited = await ForumsModel.findOneAndUpdate(
        { _id: forumID, "member.userID": user.userId },
        { $set: { "members.$.memberStatus": "inactive" } }
      );

      if (memberExited)
        console.log("You " + user.userId + " have exited forum " + forumID);

      break;
  }
});

const createATopic = asyncWrapper(async (req, res) => {
  const { forumID, subject, topicText, topicTags, topicMediaFiles } = req.body;

  var files = JSON.parse(topicMediaFiles);

  var topicMedia = [];
  let uploadOk = 1;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Check if user is a member of the forum
  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  if (forumInfo.members.length < 1) {
    if (forumOwner == user.userId) {
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          var element = files[i].files;
          for (let a = 0; a < element.length; a++) {
            var topicMediaFile = req.files[element[a]];
            allowedFiles = topicMediaFile.mimetype;
            fileSize = topicMediaFile.size;
            maxSize = 7000000;

            // If media uploaded is an image
            if (allowedFiles && allowedFiles.startsWith("image/")) {
              if (fileSize > maxSize) {
                res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ success: false, msg: "File is too big" });
                uploadOk = 0;
              } else {
                const topicMediaFileName =
                  uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                await cloudinary.uploader.upload(
                  topicMediaFile.tempFilePath,
                  {
                    resource_type: "image",
                    public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                  },
                  async function (err, logo) {
                    if (err) {
                      console.log(err);
                      uploadOk = 0;
                      return reject(err);
                    } else {
                      newTopicMedia = logo.secure_url;
                      uploadOk = 1;

                      topicMedia.push(newTopicMedia);
                    }
                  }
                );
              }
            } else if (allowedFiles && allowedFiles === "video/mp4") {
              //Check each file size
              if (topicMediaFile.size > maxSize) {
                res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ success: false, msg: "File is too big" });
                uploadOk = 0;
              } else {
                const topicMediaFileName =
                  uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                await cloudinary.uploader.upload(
                  topicMediaFile.tempFilePath,
                  {
                    resource_type: "video",
                    public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                    eager: [
                      {
                        width: 300,
                        height: 300,
                        crop: "pad",
                        audio_codec: "none",
                      },
                      {
                        width: 160,
                        height: 100,
                        crop: "crop",
                        gravity: "south",
                        audio_codec: "none",
                      },
                    ],
                  },
                  async function (err, newFile) {
                    if (err) {
                      console.log(err);
                      uploadOk = 0;
                    } else {
                      newTopicMedia = newFile.secure_url;
                      uploadOk = 1;

                      topicMedia.push(newTopicMedia);
                    }
                  }
                );
              }
            } else {
              uploadOk = 0;
              res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, msg: "This file type is not allowed" });
            }
          }
        }
      }
      const topicCreated = await ForumsTopicsModel.create({
        forumID,
        subject,
        userID: user.userId,
        topicText,
        topicTags,
        topicMedia: topicMedia,
      });

      const userActivity = await ForumsActivityModel.findOne({
        userID: user.userId,
      });

      if (userActivity) {
        ForumsActivityModel.findOneAndUpdate(
          { userID: user.userId },
          {
            $push: {
              activities: {
                activity: "post",
                forumID,
                topicID: topicCreated._id,
              },
            },
          }
        );
      } else {
        const activityCreated = await ForumsActivityModel.create({
          userID: user.userId,
          activities: [
            {
              activity: "post",
              forumID,
              topicID: topicCreated._id,
            },
          ],
        });
      }

      if (topicCreated)
        console.log(
          "User " +
            user.userId +
            " has created a new topic " +
            topicCreated._id +
            " in the forum " +
            forumID
        );

      res.status(StatusCodes.OK).json({
        success: true,
        msg: "Your topic has been posted, redirecting...",
        topicInfo: topicCreated,
      });
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        msg: "You are not allowed to perform this action because you are not a member of this forum",
      });
    }
  } else {
    for (let i = 0; i < forumInfo.members.length; i++) {
      if (
        forumInfo.members[i].userID == user.userId ||
        forumOwner == user.userId
      ) {
        if (files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            var element = files[i].files;
            for (let a = 0; a < element.length; a++) {
              var topicMediaFile = req.files[element[a]];
              allowedFiles = topicMediaFile.mimetype;
              fileSize = topicMediaFile.size;
              maxSize = 7000000;

              // If media uploaded is an image
              if (allowedFiles && allowedFiles.startsWith("image/")) {
                if (fileSize > maxSize) {
                  res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ success: false, msg: "File is too big" });
                  uploadOk = 0;
                } else {
                  const topicMediaFileName =
                    uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                  await cloudinary.uploader.upload(
                    topicMediaFile.tempFilePath,
                    {
                      resource_type: "image",
                      public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                    },
                    async function (err, logo) {
                      if (err) {
                        console.log(err);
                        uploadOk = 0;
                      } else {
                        newTopicMedia = logo.secure_url;
                        uploadOk = 1;

                        topicMedia.push(newTopicMedia);
                      }
                    }
                  );
                }
              } else if (allowedFiles && allowedFiles === "video/mp4") {
                //Check each file size
                if (topicMediaFile.size > maxSize) {
                  res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ success: false, msg: "File is too big" });
                  uploadOk = 0;
                } else {
                  const topicMediaFileName =
                    uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                  await cloudinary.uploader.upload(
                    topicMediaFile.tempFilePath,
                    {
                      resource_type: "video",
                      public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                      eager: [
                        {
                          width: 300,
                          height: 300,
                          crop: "pad",
                          audio_codec: "none",
                        },
                        {
                          width: 160,
                          height: 100,
                          crop: "crop",
                          gravity: "south",
                          audio_codec: "none",
                        },
                      ],
                    },
                    async function (err, newFile) {
                      if (err) {
                        console.log(err);
                        uploadOk = 0;
                      } else {
                        newTopicMedia = newFile.secure_url;
                        uploadOk = 1;

                        topicMedia.push(newTopicMedia);
                      }
                    }
                  );
                }
              } else {
                uploadOk = 0;
                res.status(StatusCodes.BAD_REQUEST).json({
                  success: false,
                  msg: "This file type is not allowed",
                });
              }
            }
          }
        }

        const topicCreated = await ForumsTopicsModel.create({
          forumID,
          subject,
          userID: user.userId,
          topicText,
          topicTags,
          topicMedia,
        });

        const userActivity = await ForumsActivityModel.findOne({
          userID: user.userId,
        });

        if (userActivity) {
          ForumsActivityModel.findOneAndUpdate(
            { userID: user.userId },
            {
              $push: {
                activities: {
                  activity: "post",
                  forumID,
                  topicID: topicCreated._id,
                },
              },
            }
          );
        } else {
          const activityCreated = await ForumsActivityModel.create({
            userID: user.userId,
            activities: [
              {
                activity: "post",
                forumID,
                topicID: topicCreated._id,
              },
            ],
          });
        }

        if (topicCreated)
          console.log(
            "User " +
              user.userId +
              " has created a new topic " +
              topicCreated._id +
              " in the forum " +
              forumID
          );

        res.status(StatusCodes.OK).json({
          success: true,
          msg: "Your topic has been posted, redirecting...",
          topicInfo: topicCreated,
        });
      } else {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          msg: "You are not allowed to perform this action because you are not a member of this forum",
        });
      }
    }
  }
});

const deleteATopic = asyncWrapper(async (req, res) => {
  const { forumID, topicID, topicCreator } = data;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  if (topicCreator == user.userId) {
    const topicDeleted = await ForumsTopicsModel.findByIdAndDelete({
      _id: topicID,
    });

    if (topicDeleted) {
      console.log(
        "Topic " + topicID + " has been deleted from the forum " + forumID
      );
    }
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "You are not allowed to perform this action because you didn't create this topic"
      );
  }
});

const replyToATopic = asyncWrapper(async (req, res) => {
  const { topicID, forumID, taggedResponseID, replyText, responseMediaFiles } =
    req.body;

  var files = JSON.parse(responseMediaFiles);
  let replyMedia = [];
  let uploadOk = 1;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Check if user is a member of the forum
  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  if (forumInfo.members.length < 1) {
    if (forumOwner == user.userId) {
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          var element = files[i].files;
          for (let a = 0; a < element.length; a++) {
            var topicMediaFile = req.files[element[a]];
            allowedFiles = topicMediaFile.mimetype;
            fileSize = topicMediaFile.size;
            maxSize = 7000000;

            // If media uploaded is an image
            if (allowedFiles && allowedFiles.startsWith("image/")) {
              if (fileSize > maxSize) {
                res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ success: false, msg: "File is too big" });
                uploadOk = 0;
              } else {
                const topicMediaFileName =
                  uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                await cloudinary.uploader.upload(
                  topicMediaFile.tempFilePath,
                  {
                    resource_type: "image",
                    public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                  },
                  async function (err, logo) {
                    if (err) {
                      console.log(err);
                      uploadOk = 0;
                      return reject(err);
                    } else {
                      newTopicMedia = logo.secure_url;
                      uploadOk = 1;

                      replyMedia.push(newTopicMedia);
                    }
                  }
                );
              }
            } else if (allowedFiles && allowedFiles === "video/mp4") {
              //Check each file size
              if (topicMediaFile.size > maxSize) {
                res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ success: false, msg: "File is too big" });
                uploadOk = 0;
              } else {
                const topicMediaFileName =
                  uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                await cloudinary.uploader.upload(
                  topicMediaFile.tempFilePath,
                  {
                    resource_type: "video",
                    public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                    eager: [
                      {
                        width: 300,
                        height: 300,
                        crop: "pad",
                        audio_codec: "none",
                      },
                      {
                        width: 160,
                        height: 100,
                        crop: "crop",
                        gravity: "south",
                        audio_codec: "none",
                      },
                    ],
                  },
                  async function (err, newFile) {
                    if (err) {
                      console.log(err);
                      uploadOk = 0;
                    } else {
                      newTopicMedia = newFile.secure_url;
                      uploadOk = 1;

                      replyMedia.push(newTopicMedia);
                    }
                  }
                );
              }
            } else {
              uploadOk = 0;
              res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, msg: "This file type is not allowed" });
            }
          }
        }
      }

      var replyObj = {
        taggedResponseID,
        userID: user.userId,
        replyText,
        replyMedia,
      };
      const responses = await ForumsTopicsModel.findByIdAndUpdate(
        { _id: topicID },
        { $push: { responses: replyObj } },
        { returnOriginal: false }
      );

      const response = responses.responses.pop();
      const userInfo = await AuthModel.findById(
        response.userID,
        "username avatar about"
      );
      if (response.userID == forumInfo.creator) {
        var replyPosted = {
          response,
          userInfo,
          topicInfo: responses,
          forumInfo,
          memberUpvotes: forumInfo.ownerUpvotes,
        };
      } else {
        for (let i = 0; i < forumInfo.members.length; i++) {
          const member = forumInfo.members[i];

          if (response.userID == member.userID) {
            var replyPosted = {
              response,
              userInfo,
              topicInfo: responses,
              forumInfo,
              memberUpvotes: member.upvotes,
            };
          }
        }
      }

      const userActivity = await ForumsActivityModel.findOne({
        userID: user.userId,
      });

      if (userActivity) {
        ForumsActivityModel.findOneAndUpdate(
          { userID: user.userId },
          {
            $push: {
              activities: {
                activity: "response",
                forumID,
                topicID,
                responseID: replyPosted.response.responseID,
              },
            },
          }
        );
      } else {
        const activityCreated = await ForumsActivityModel.create({
          userID: user.userId,
          activities: [
            {
              activity: "response",
              forumID,
              topicID,
              responseID: replyPosted.response.responseID,
            },
          ],
        });
      }

      if (replyPosted)
        console.log(
          "Your response on topic " +
            topicID +
            " has been posted with an ID " +
            replyPosted.response.responseID
        );

      res.status(StatusCodes.OK).json({
        success: true,
        msg: "Your response has been posted.",
        replyInfo: replyPosted,
      });
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        msg: "You are not allowed to perform this action because you are not a member of this forum",
      });
    }
  } else {
    for (let i = 0; i < forumInfo.members.length; i++) {
      if (
        forumInfo.members[i].userID == user.userId ||
        forumOwner == user.userId
      ) {
        if (files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            var element = files[i].files;
            for (let a = 0; a < element.length; a++) {
              var topicMediaFile = req.files[element[a]];
              allowedFiles = topicMediaFile.mimetype;
              fileSize = topicMediaFile.size;
              maxSize = 7000000;

              // If media uploaded is an image
              if (allowedFiles && allowedFiles.startsWith("image/")) {
                if (fileSize > maxSize) {
                  res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ success: false, msg: "File is too big" });
                  uploadOk = 0;
                } else {
                  const topicMediaFileName =
                    uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                  await cloudinary.uploader.upload(
                    topicMediaFile.tempFilePath,
                    {
                      resource_type: "image",
                      public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                    },
                    async function (err, logo) {
                      if (err) {
                        console.log(err);
                        uploadOk = 0;
                      } else {
                        newTopicMedia = logo.secure_url;
                        uploadOk = 1;

                        replyMedia.push(newTopicMedia);
                      }
                    }
                  );
                }
              } else if (allowedFiles && allowedFiles === "video/mp4") {
                //Check each file size
                if (topicMediaFile.size > maxSize) {
                  res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ success: false, msg: "File is too big" });
                  uploadOk = 0;
                } else {
                  const topicMediaFileName =
                    uuidv4() + "_" + topicMediaFile.name.split(".")[0];

                  await cloudinary.uploader.upload(
                    topicMediaFile.tempFilePath,
                    {
                      resource_type: "video",
                      public_id: `forumTopicMediaFiles/${topicMediaFileName}`,
                      eager: [
                        {
                          width: 300,
                          height: 300,
                          crop: "pad",
                          audio_codec: "none",
                        },
                        {
                          width: 160,
                          height: 100,
                          crop: "crop",
                          gravity: "south",
                          audio_codec: "none",
                        },
                      ],
                    },
                    async function (err, newFile) {
                      if (err) {
                        console.log(err);
                        uploadOk = 0;
                      } else {
                        newTopicMedia = newFile.secure_url;
                        uploadOk = 1;

                        replyMedia.push(newTopicMedia);
                      }
                    }
                  );
                }
              } else {
                uploadOk = 0;
                res.status(StatusCodes.BAD_REQUEST).json({
                  success: false,
                  msg: "This file type is not allowed",
                });
              }
            }
          }
        }

        var replyObj = {
          taggedResponseID,
          userID: user.userId,
          replyText,
          replyMedia,
        };
        const responses = await ForumsTopicsModel.findByIdAndUpdate(
          { _id: topicID },
          { $push: { responses: replyObj } },
          { returnOriginal: false }
        );

        const response = responses.responses.pop();
        const userInfo = await AuthModel.findById(
          response.userID,
          "username avatar about"
        );
        if (response.userID == forumInfo.creator) {
          var replyPosted = {
            response,
            userInfo,
            topicInfo: responses,
            forumInfo,
            memberUpvotes: forumInfo.ownerUpvotes,
          };
        } else {
          for (let i = 0; i < forumInfo.members.length; i++) {
            const member = forumInfo.members[i];

            if (response.userID == member.userID) {
              var replyPosted = {
                response,
                userInfo,
                topicInfo: responses,
                forumInfo,
                memberUpvotes: member.upvotes,
              };
            }
          }
        }

        const userActivity = await ForumsActivityModel.findOne({
          userID: user.userId,
        });

        if (userActivity) {
          ForumsActivityModel.findOneAndUpdate(
            { userID: user.userId },
            {
              $push: {
                activities: {
                  activity: "response",
                  forumID,
                  topicID,
                  responseID: replyPosted.response.responseID,
                },
              },
            }
          );
        } else {
          const activityCreated = await ForumsActivityModel.create({
            userID: user.userId,
            activities: [
              {
                activity: "response",
                forumID,
                topicID,
                responseID: replyPosted.response.responseID,
              },
            ],
          });
        }

        if (replyPosted)
          console.log(
            "Your response on topic " +
              topicID +
              " has been posted with an ID " +
              replyPosted.response.responseID
          );

        res.status(StatusCodes.OK).json({
          success: true,
          msg: "Your response has been posted",
          replyInfo: replyPosted,
        });
      } else {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          msg: "You are not allowed to perform this action because you are not a member of this forum",
        });
      }
    }
  }
});

const deleteAResponse = asyncWrapper(async (req, res) => {
  const { forumID, topicID, responseID, responseCreator } = data;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  if (responseCreator == user.userId) {
    const responseDeleted = await ForumsTopicsModel.findByIdAndUpdate(
      { _id: topicID },
      { $pull: { responses: { responseID } } }
    );

    if (responseDeleted) {
      console.log(
        "Response " + responseID + " has been deleted from the forum " + forumID
      );
    }
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "You are not allowed to perform this action because you didn't create this response"
      );
  }
});

const visitMemberProfile = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const forumID = req.params.forumID;
  const memberID = req.query.memberID;
  let isAMember = false;
  let profileInfo;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const forumInfo = await ForumsModel.findById(forumID, "forumName members");
  const memberInfo = await AuthModel.findById(
    memberID,
    "username avatar about"
  );

  // Check if the user trying to access the profile is a member of the forum
  for (let i = 0; i < forumInfo.members.length; i++) {
    if (forumInfo.members[i].userID == user.userId) {
      isAMember = true;
    }
  }

  // If user is a member, fetch profile info
  if (isAMember == true) {
    for (let i = 0; i < forumInfo.members.length; i++) {
      if (forumInfo.members[i].userID == memberID) {
        profileInfo = forumInfo.members[i];
      }
    }
  }

  res.locals.profileInfo = profileInfo;
  res.locals.memberInfo = memberInfo;

  //Render Member Profile Page
  res.status(StatusCodes.OK).render("./dashboard/public/forum_member_profile", {
    headTitle: "Forum - " + forumInfo.forumName,
    page_name,
  });
});

module.exports = {
  forums,
  singleForum,
  forumTopicInfo,
  createForum,
  modifyModerators,
  updateForumRanks,
  deleteForum,
  updateForumDisplayPic,
  updateForumProfile,
  performActionAsModerator,
  updateForumInvites,
  createATopic,
  deleteATopic,
  replyToATopic,
  deleteAResponse,
  visitMemberProfile,
};
