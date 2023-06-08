const path = require("path");
const fs = require("fs");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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
const UserUpvotesModel = require("../../../models/UserUpvotesModel");

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

const processInvite = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const forumID = req.params.forumID;
  const secretKey = req.query.secretKey;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const forumInfoKey = await ForumsModel.findById(forumID);

  const isMatch = await bcrypt.compare(forumInfoKey.forumSecretKey, secretKey);
  if (isMatch) {
    // Check if user is already a member of the forum
    var isAlreadyAMember = false;
    if (forumInfoKey.creator == user.userId) {
      isAlreadyAMember = true;
    } else {
      if (forumInfoKey.members.length > 0) {
        for (let i = 0; i < forumInfoKey.members.length; i++) {
          const member = forumInfoKey.members[i];
          if (member.userID == user.userId) {
            isAlreadyAMember = true;
          }
        }
      }
    }

    if (isAlreadyAMember == true) {
      var msg = {
        success: true,
        content: "You are already a member of this forum",
      };
    } else {
      const newMemberAdded = await ForumsModel.findByIdAndUpdate(
        { _id: forumID },
        {
          $push: {
            members: {
              userID: user.userId,
            },
          },
        }
      );

      if (newMemberAdded) {
        console.log(
          "New Member " + user.userId + " has joined the forum " + forumID
        );
      }

      var msg = {
        success: true,
        content: "Welcome to " + forumInfoKey.forumName,
      };
    }

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
    var topic_per_page = 15;
    var topicsModel = allTopics.slice(0, topic_per_page);
    var totalPages = Math.ceil(allTopics.length / topic_per_page);
    var isAMember = false;
    var isAModerator = false;

    const forumInfo = await ForumsModel.findById(forumID);

    // Check if user is an admin
    for (let i = 0; i < forumInfo.moderators.length; i++) {
      const moderator = forumInfo.moderators[i];
      if (user.userId == moderator.userID) {
        isAModerator = true;
      }
    }
    if (user.userId == forumInfo.creator) {
      isAMember = true;
      isAModerator = true;
    } else {
      for (let i = 0; i < forumInfo.members.length; i++) {
        const member = forumInfo.members[i];
        if (user.userId == member.userID) {
          isAMember = true;
        }
      }
    }
    for (let i = 0; i < topicsModel.length; i++) {
      const userInfo = await AuthModel.findById(
        topicsModel[i].userID,
        "username avatar about"
      );
      if (topicsModel[i].userID == forumInfo.creator) {
        topics.push({
          topic: topicsModel[i],
          userInfo,
          memberUpvotes: forumInfo.ownerUpvotes,
        });
      } else {
        for (let i = 0; i < forumInfo.members.length; i++) {
          const member = forumInfo.members[i];
          if (user.userId == member.userID) {
            isAMember = true;
          }
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
    res.locals.forumInfo = forumInfo;
    res.locals.topics = topics;
    res.locals.isAMember = isAMember;
    res.locals.isAModerator = isAModerator;
    res.locals.incomingMsg = true;
    res
      .status(StatusCodes.OK)
      .render("./dashboard/public/forums/single_forum_page", {
        headTitle: "Smart Forums - " + forumInfo.forumName,
        page_name,
        totalPages,
        msg,
      });
  } else {
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
    var topic_per_page = 15;
    var topicsModel = allTopics.slice(0, topic_per_page);
    var totalPages = Math.ceil(allTopics.length / topic_per_page);
    var isAMember = false;
    var isAModerator = false;

    const forumInfo = await ForumsModel.findById(forumID);

    // Check if user is an admin
    for (let i = 0; i < forumInfo.moderators.length; i++) {
      const moderator = forumInfo.moderators[i];
      if (user.userId == moderator.userID) {
        isAModerator = true;
      }
    }
    for (let i = 0; i < topicsModel.length; i++) {
      const userInfo = await AuthModel.findById(
        topicsModel[i].userID,
        "username avatar about"
      );
      if (topicsModel[i].userID == forumInfo.creator) {
        if (user.userId == forumInfo.creator) {
          isAMember = true;
          isAModerator = true;
        }
        topics.push({
          topic: topicsModel[i],
          userInfo,
          memberUpvotes: forumInfo.ownerUpvotes,
        });
      } else {
        for (let i = 0; i < forumInfo.members.length; i++) {
          const member = forumInfo.members[i];
          if (user.userId == member.userID) {
            isAMember = true;
          }
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
    res.locals.forumInfo = forumInfo;
    res.locals.topics = topics;
    res.locals.isAMember = isAMember;
    res.locals.isAModerator = isAModerator;
    res.locals.incomingMsg = true;
    res
      .status(StatusCodes.OK)
      .render("./dashboard/public/forums/single_forum_page", {
        headTitle: "Smart Forums - " + forumInfo.forumName,
        page_name,
        totalPages,
        msg: {
          success: false,
          content: `Cannot join forum, please check your invite link and try again!`,
        },
      });
  }
});

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
  var topic_per_page = 15;
  var topicsModel = allTopics.slice(0, topic_per_page);
  var totalPages = Math.ceil(allTopics.length / topic_per_page);
  var isAMember = false;
  var isAModerator = false;

  const forumInfo = await ForumsModel.findById(forumID);

  // Check if user is a member
  if (user.userId == forumInfo.creator) {
    isAMember = true;
    isAModerator = true;
  }else{
    for (let i = 0; i < forumInfo.members.length; i++) {
      const member = forumInfo.members[i];
      if (user.userId == member.userID) {
        isAMember = true;
      }
    }
  }

  // Check if user is an admin
  for (let i = 0; i < forumInfo.moderators.length; i++) {
    const moderator = forumInfo.moderators[i];
    if (user.userId == moderator.userID) {
      isAModerator = true;
    }
  }

  for (let i = 0; i < topicsModel.length; i++) {
    const userInfo = await AuthModel.findById(
      topicsModel[i].userID,
      "username avatar about"
    );
    if (topicsModel[i].userID == forumInfo.creator) {
      topics.push({
        topic: topicsModel[i],
        userInfo,
        memberUpvotes: forumInfo.ownerUpvotes,
      });
    } else {
      for (let i = 0; i < forumInfo.members.length; i++) {
        const member = forumInfo.members[i];
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

  const forumRanks = await ForumRankingsModel.findOne({ forumID });

  res.locals.forums = fetchAllForums;
  res.locals.invites = invites;
  res.locals.forumID = forumID;
  res.locals.forumInfo = forumInfo;
  res.locals.topics = topics;
  res.locals.isAMember = isAMember;
  res.locals.isAModerator = isAModerator;
  res.locals.incomingMsg = false;
  res.locals.forumRanks = forumRanks;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/public/forums/single_forum_page", {
      headTitle: "Smart Forums - " + forumInfo.forumName,
      page_name,
      totalPages,
    });
};

const forumTopicInfo = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const forumID = req.params.forumID;
  const topicID = req.query.topicID;
  var isAMember = false;
  var isAModerator = false;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  // Update number of views
  const getTopicViews = await ForumsTopicsModel.findById({ _id: topicID });
  var newViewsNumber = getTopicViews.__v + 1;
  await ForumsTopicsModel.findByIdAndUpdate(
    { _id: topicID },
    { __v: newViewsNumber }
  );

  const topicInfo = await ForumsTopicsModel.findById({ _id: topicID });
  const topicResponses = topicInfo.responses;

  const responses = [];
  let questionnaire;

  const forumInfo = await ForumsModel.findById({ _id: forumID });

  // Check if user is a member
  if (user.userId == forumInfo.creator) {
    isAMember = true;
    isAModerator = true;
  }else{
    for (let i = 0; i < forumInfo.members.length; i++) {
      const member = forumInfo.members[i];
      if (user.userId == member.userID) {
        isAMember = true;
      }
    }
  }

  // Check if user is an admin
  for (let i = 0; i < forumInfo.moderators.length; i++) {
    const moderator = forumInfo.moderators[i];
    if (user.userId == moderator.userID) {
      isAModerator = true;
    }
  }

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

  var responsesUpvoted = [];

  // Get all responses with user info and upvotes
  for (let i = 0; i < topicResponses.length; i++) {
    const response = topicResponses[i];
    const userInfo = await AuthModel.findById(
      response.userID,
      "username avatar about"
    );

    //Check if the response is among the responses upvoted by user
    var responseUpvotePresent = await UserUpvotesModel.findOne({
      userID: user.userId,
      $and: [
        { "myUpvotes.forumID": forumID },
        { "myUpvotes.responseID": response._id },
      ],
    });

    if (responseUpvotePresent) {
      responsesUpvoted.push(response._id);
    }

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

  // Check if topic is bookmarked by current user
  var bookmarked = false;
  for (let i = 0; i < topicInfo.bookmarks.length; i++) {
    const bookmark = topicInfo.bookmarks[i];
    if (bookmark.userID == user.userId) {
      bookmarked = true;
    }
  }

  //Check if user has upvoted the current topic
  const userUpvote = await UserUpvotesModel.findOne({
    userID: user.userId,
    $and: [{ "myUpvotes.forumID": forumID }, { "myUpvotes.topicID": topicID }],
  });

  var topicUpvotedByUser = false;
  if (userUpvote) {
    topicUpvotedByUser = true;
  }

  const forumRanks = await ForumRankingsModel.findOne({ forumID });
  
  res.locals.forumID = forumID;
  res.locals.forumInfo = forumInfo;
  res.locals.topicInfo = topicInfo;
  res.locals.questionnaire = questionnaire;
  res.locals.responses = responses;
  res.locals.forums = fetchAllForums;
  res.locals.invites = invites;
  res.locals.bookmarked = bookmarked;
  res.locals.isAMember = isAMember;
  res.locals.isAModerator = isAModerator;
  res.locals.responsesUpvoted = responsesUpvoted;
  res.locals.topicUpvotedByUser = topicUpvotedByUser;
  res.locals.forumRanks = forumRanks;

  res.status(StatusCodes.OK).render("./dashboard/public/forums/topic_page", {
    headTitle: "Forum - " + forumInfo.forumName,
    page_name,
  });
});

/*
===================================================================================================
SPECIAL OPERATIONS PERFORMED AS A FORUM CREATOR
-- Create a forum
-- Assign Moderators
-- Update Forum Ranks
-- Delete a forum
===================================================================================================
*/
const createForum = asyncWrapper(async (req, res) => {
  const { forumName, forumDesc } = req.body;
  const { displayPic } = req.files;
  let allowedFiles, fileSize, maxSize;

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

      await cloudinary.uploader.upload(
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

        //Send success back to frontend
        res.status(StatusCodes.OK).json({
          success: true,
          msg: "Member has been added as a new moderator",
        });
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

        //Send success back to frontend
        res.status(StatusCodes.OK).json({
          success: true,
          msg: "Member has been removed as an moderator",
        });
        break;
    }
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({
        success: false,
        msg: "You are not allowed to perform this action.",
      });
  }
});

const updateForumRanks = asyncWrapper(async (req, res) => {
  const {
    forumID,
    rank,
    minUpvotesRequiredText,
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
    var ranksUpdated;
    var minUpvotesRequired = parseInt(minUpvotesRequiredText);
    switch (rank) {
      case "newbie":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            newbie: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "rookie":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            rookie: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "apprentice":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            apprentice: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "explorer":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            explorer: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "contributor":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            contributor: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "enthusiast":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            enthusiast: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "collaborator":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            collaborator: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "communityRegular":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            communityRegular: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "risingStar":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            risingStar: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "proficient":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            proficient: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "experienced":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            experienced: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "mentor":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            mentor: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "veteran":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            veteran: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "master":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            master: {
              minUpvotesRequired,
            }
          }
        );
        break;
      case "grandmaster":
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            grandmaster: {
              minUpvotesRequired,
            }
          }
        );
        break;
        
      default:
        ranksUpdated = await ForumRankingsModel.findOneAndUpdate(
          { _id: forumID },
          {
            legendary: {
              minUpvotesRequired,
            }
          }
        );
        break;
    }

    // if (ranksUpdated){
      console.log("Forum " + forumID + " 's rank system has been updated"); 
      //Send success back to frontend
      res.status(StatusCodes.OK).json({
        success: true,
        msg: "Forum rank has been updated successfully!",
      }); 
    // }
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({
        success: false,
        msg: "You are not allowed to perform this action.",
      });
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
  const { forumID } = req.body
  var allowedToPerformTask = false;

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

  if(forumOwner == user.userId){
    allowedToPerformTask = true;
  }else{
    if(forumInfo.moderators.length > 0){
      for (let i = 0; i < forumInfo.moderators.length; i++) {
        if (forumInfo.moderators[i].userID == user.userId) {
          allowedToPerformTask = true;
        } else {
          allowedToPerformTask = false;
        }
      }
    }else{
      allowedToPerformTask = false;
    }
  }
  
  if(allowedToPerformTask == true){
    let newPicPath;
    let uploadOk = 1;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: "No files were uploaded." });
    }
  
    var allowedLogoFiles = displayPic.mimetype;
    var logoFileSize = req.files.displayPic.size;
    var maxSize = 7000000;
  
    if (allowedLogoFiles && allowedLogoFiles.startsWith("image/")) {
      if (logoFileSize > maxSize) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: false, msg: "File is too big" });
        uploadOk = 0;
      } else {
        const displayPicName = uuidv4() + "_" + displayPic.name.split(".")[0];
  
        await cloudinary.uploader.upload(
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
                },
                { returnOriginal: false }
              );
              console.log(
                "Forum " +
                  req.body.forumID +
                  " 's display picture has been updated."
              );
  
              fs.unlinkSync(displayPic.tempFilePath);
  
              //Send success back to frontend
              res.status(StatusCodes.OK).json({
                success: true,
                msg: "Forum display picture has been updated successfully!",
                forumInfo,
              });
            }
          }
        );
      }
    }
  }else{
    res
      .status(StatusCodes.FORBIDDEN)
      .json({
        success: false,
        msg: "You are not allowed to perform this action.",
      });
  }
});

const updateForumProfile = asyncWrapper(async (req, res) => {
  const { forumID, forumName, forumDesc, lookUpValue, wordsFilter } = req.body;

  const newWordsFilter = wordsFilter.split(",");

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

  if(forumOwner == user.userId){
    const updateInfo = {
      forumName,
      forumDesc,
      availableForLookUp,
      wordsFilter: newWordsFilter,
    };

    const infoUpdated = await ForumsModel.findByIdAndUpdate(
      { _id: forumID },
      updateInfo
    );

    //Send success back to frontend
    res.status(StatusCodes.OK).json({
      success: true,
      msg: "Forum profile has been updated successfully!",
    });

    if (infoUpdated) {
      console.log("Forum " + forumID + " Profile has been updated");
    }
  }else{
    if(forumInfo.moderators.length > 0){
      for (let i = 0; i < forumInfo.moderators.length; i++) {
        if (forumInfo.moderators[i].userID == user.userId) {
          const updateInfo = {
            forumName,
            forumDesc,
            availableForLookUp,
            wordsFilter: newWordsFilter,
          };
    
          const infoUpdated = await ForumsModel.findByIdAndUpdate(
            { _id: forumID },
            updateInfo
          );

          //Send success back to frontend
          res.status(StatusCodes.OK).json({
            success: true,
            msg: "Forum profile has been updated successfully!",
          });
    
          if (infoUpdated) {
            console.log("Forum " + forumID + " Profile has been updated");
          }
        } else {
          res
            .status(StatusCodes.FORBIDDEN)
            .json({
              success: false,
              msg: "You are not allowed to perform this action.",
            });
        }
      }
    }else{
      res
      .status(StatusCodes.FORBIDDEN)
      .json({
        success: false,
        msg: "You are not allowed to perform this action.",
      });
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
  const { forumID, subject, topicText, newTopicTags, topicMediaFiles } =
    req.body;
  const topicTags = newTopicTags.split(",");

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
        await ForumsActivityModel.findOneAndUpdate(
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
          await ForumsActivityModel.findOneAndUpdate(
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
  const { forumID, topicID, topicCreator } = req.body;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  // Delete a Topic as a topic creator
  if (topicCreator == user.userId) {
    const topicDeleted = await ForumsTopicsModel.findByIdAndDelete({
      _id: topicID,
    });

    await ForumsActivityModel.findOneAndUpdate(
      { userID: user.userId },
      {
        $pull: {
          activities: {
            activity: "post",
            forumID,
            topicID,
          },
        },
      }
    );

    if (topicDeleted) {
      console.log(
        "Topic " + topicID + " has been deleted from the forum " + forumID
      );

      res.status(StatusCodes.OK).json({
        success: true,
        msg: "Your topic has been deleted!",
      });
    }
  } else {
    for (let i = 0; i < forumInfo.moderators.length; i++) {
      // Delete a topic as a moderator or forum owner
      if (
        forumInfo.moderators[i].userID == user.userId ||
        forumOwner == user.userId
      ) {
        const topicDeleted = await ForumsTopicsModel.findByIdAndDelete({
          _id: topicID,
        });

        await ForumsActivityModel.findOneAndUpdate(
          { userID: user.userId },
          {
            $pull: {
              activities: {
                activity: "post",
                forumID,
                topicID,
              },
            },
          }
        );

        if (topicDeleted) {
          console.log(
            "Moderator " +
              user.userId +
              " has deleted topic " +
              topicID +
              " from the forum " +
              forumID
          );

          res.status(StatusCodes.OK).json({
            success: true,
            msg: "Topic has been deleted!",
          });
        }
      } else {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          msg: "You are not allowed to perform this action because you are not a member of this forum",
        });
      }
    }
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
        await ForumsActivityModel.findOneAndUpdate(
          { userID: user.userId },
          {
            $push: {
              activities: {
                activity: "response",
                forumID,
                topicID,
                responseID: replyPosted.response._id,
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
              responseID: replyPosted.response._id,
            },
          ],
        });
      }

      if (replyPosted)
        console.log(
          "Your response on topic " +
            topicID +
            " has been posted with an ID " +
            replyPosted.response._id
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
          await ForumsActivityModel.findOneAndUpdate(
            { userID: user.userId },
            {
              $push: {
                activities: {
                  activity: "response",
                  forumID,
                  topicID,
                  responseID: replyPosted.response._id,
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
                responseID: replyPosted.response._id,
              },
            ],
          });
        }

        if (replyPosted)
          console.log(
            "Your response on topic " +
              topicID +
              " has been posted with an ID " +
              replyPosted.response._id
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
  const { forumID, topicID, responseID, responseCreator } = req.body;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const forumInfo = await ForumsModel.findById({ _id: forumID });
  const forumOwner = forumInfo.creator;

  // Delete a response as a response creator
  if (responseCreator == user.userId) {
    const responseDeleted = await ForumsTopicsModel.findByIdAndUpdate(
      { _id: topicID },
      { $pull: { responses: { _id: responseID } } }
    );

    await ForumsActivityModel.findOneAndUpdate(
      { userID: user.userId },
      {
        $pull: {
          activities: {
            activity: "response",
            forumID,
            topicID,
            responseID,
          },
        },
      }
    );

    if (responseDeleted) {
      console.log(
        "Response " + responseID + " has been deleted from the forum " + forumID
      );

      res.status(StatusCodes.OK).json({
        success: true,
        msg: "Your response has been deleted!",
      });
    }
  } else {
    for (let i = 0; i < forumInfo.moderators.length; i++) {
      // Delete a response as a moderator or forum owner
      if (
        forumInfo.moderators[i].userID == user.userId ||
        forumOwner == user.userId
      ) {
        const responseDeleted = await ForumsTopicsModel.findByIdAndUpdate(
          { _id: topicID },
          { $pull: { responses: { _id: responseID } } }
        );

        await ForumsActivityModel.findOneAndUpdate(
          { userID: user.userId },
          {
            $pull: {
              activities: {
                activity: "response",
                forumID,
                topicID,
                responseID,
              },
            },
          }
        );

        if (responseDeleted) {
          console.log(
            "Moderator " +
              user.userId +
              " has deleted response " +
              responseID +
              " from the forum " +
              forumID
          );

          res.status(StatusCodes.OK).json({
            success: true,
            msg: "Your response has been deleted!",
          });
        }
      } else {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          msg: "You are not allowed to perform this action because you are not a member of this forum",
        });
      }
    }
  }
});

const visitMemberProfile = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const forumID = req.params.forumID;
  const memberID = req.query.memberID;
  let isAMember = false;
  let isForumCreator = false;
  let isAModerator = false;
  let profileInfo;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const forumInfo = await ForumsModel.findById(forumID);
  const memberInfo = await AuthModel.findById(
    memberID,
    "username avatar about"
  );

  // Check if the user trying to access the profile is a member or owner of the forum
  if (forumInfo.creator == user.userId) {
    isAMember = true;
  } else {
    for (let i = 0; i < forumInfo.members.length; i++) {
      if (forumInfo.members[i].userID == user.userId) {
        isAMember = true;
      }
    }
  }

  // If user is a member, fetch profile info
  // if (isAMember == true) {
  if (forumInfo.creator == memberID) {
    isForumCreator = true;
  } else {
    for (let i = 0; i < forumInfo.moderators.length; i++) {
      const moderator = forumInfo.moderators[i];
      if (memberID == moderator.userID) {
        isAModerator = true;
      }
    }
    for (let i = 0; i < forumInfo.members.length; i++) {
      if (forumInfo.members[i].userID == memberID) {
        profileInfo = forumInfo.members[i];
      }
    }
  }
  // }

  //Fetch User's forums
  const fetchAllForums = await ForumsModel.find({
    $or: [{ creator: user.userId }, { "members.userID": user.userId }],
  });
  // Fetch user's forum invites
  const invites = await ForumsModel.find({
    $and: [{ "invites.userID": user.userId }, { "invites.incoming": false }],
  });
  const recentActivities = await ForumsActivityModel.findOne({
    userID: user.userId,
  });
  var activities = recentActivities.activities.slice(-20).reverse();

  let numberOfPosts = 0;
  const forumTopics = await ForumsTopicsModel.find({
    forumID,
  });
  //Count Number of user's posts
  for (let i = 0; i < forumTopics.length; i++) {
    if (forumTopics[i].userID == memberID) {
      numberOfPosts++;
    }
    for (let a = 0; a < forumTopics[i].responses.length; a++) {
      if (forumTopics[i].responses[a].userID == memberID) {
        numberOfPosts++;
      }
    }
  }
  if (isForumCreator == false) {
    let memberRank;
    const forumRanks = await ForumRankingsModel.findOne({ forumID });
    var memberUpvote = profileInfo.upvotes;
    if (memberUpvote < forumRanks.rookie.minUpvotesRequired) {
      memberRank = "Newbie";
    } else if (
      memberUpvote >= forumRanks.rookie.minUpvotesRequired &&
      memberUpvote < forumRanks.apprentice.minUpvotesRequired
    ) {
      memberRank = "Rookie";
    } else if (
      memberUpvote >= forumRanks.apprentice.minUpvotesRequired &&
      memberUpvote < forumRanks.explorer.minUpvotesRequired
    ) {
      memberRank = "Apprentice";
    } else if (
      memberUpvote >= forumRanks.explorer.minUpvotesRequired &&
      memberUpvote < forumRanks.contributor.minUpvotesRequired
    ) {
      memberRank = "Explorer";
    } else if (
      memberUpvote >= forumRanks.contributor.minUpvotesRequired &&
      memberUpvote < forumRanks.enthusiast.minUpvotesRequired
    ) {
      memberRank = "Contributor";
    } else if (
      memberUpvote >= forumRanks.enthusiast.minUpvotesRequired &&
      memberUpvote < forumRanks.collaborator.minUpvotesRequired
    ) {
      memberRank = "Enthusiast";
    } else if (
      memberUpvote >= forumRanks.collaborator.minUpvotesRequired &&
      memberUpvote < forumRanks.communityRegular.minUpvotesRequired
    ) {
      memberRank = "Collaborator";
    } else if (
      memberUpvote >= forumRanks.communityRegular.minUpvotesRequired &&
      memberUpvote < forumRanks.risingStar.minUpvotesRequired
    ) {
      memberRank = "Community Regular";
    } else if (
      memberUpvote >= forumRanks.risingStar.minUpvotesRequired &&
      memberUpvote < forumRanks.proficient.minUpvotesRequired
    ) {
      memberRank = "Rising Star";
    } else if (
      memberUpvote >= forumRanks.proficient.minUpvotesRequired &&
      memberUpvote < forumRanks.experienced.minUpvotesRequired
    ) {
      memberRank = "Proficient";
    } else if (
      memberUpvote >= forumRanks.experienced.minUpvotesRequired &&
      memberUpvote < forumRanks.mentor.minUpvotesRequired
    ) {
      memberRank = "Experienced";
    } else if (
      memberUpvote >= forumRanks.mentor.minUpvotesRequired &&
      memberUpvote < forumRanks.veteran.minUpvotesRequired
    ) {
      memberRank = "Mentor";
    } else if (
      memberUpvote >= forumRanks.veteran.minUpvotesRequired &&
      memberUpvote < forumRanks.master.minUpvotesRequired
    ) {
      memberRank = "Veteran";
    } else if (
      memberUpvote >= forumRanks.master.minUpvotesRequired &&
      memberUpvote < forumRanks.grandmaster.minUpvotesRequired
    ) {
      memberRank = "Master";
    } else if (
      memberUpvote >= forumRanks.grandmaster.minUpvotesRequired &&
      memberUpvote < forumRanks.lengendary.minUpvotesRequired
    ) {
      memberRank = "Grandmaster";
    } else {
      memberRank = "Legendary";
    }
    res.locals.memberRank = memberRank;
  }

  res.locals.forumID = forumID;
  res.locals.forumInfo = forumInfo;
  res.locals.isForumCreator = isForumCreator;
  res.locals.isAModerator = isAModerator;
  res.locals.forums = fetchAllForums;
  res.locals.invites = invites;
  res.locals.profileInfo = profileInfo;
  res.locals.memberInfo = memberInfo;
  res.locals.membersNoOfPosts = numberOfPosts;
  res.locals.recentActivities = activities;

  //Render Member Profile Page
  res
    .status(StatusCodes.OK)
    .render("./dashboard/public/forums/user_profile_page", {
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
  processInvite,
};
