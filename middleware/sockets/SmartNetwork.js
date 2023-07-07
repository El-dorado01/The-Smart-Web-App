require("express-async-errors");
const asyncWrapper = require("../async");
const { v4: uuidv4 } = require("uuid");

const AuthModel = require("../../models/AuthModel");
const BookmarkModel = require("../../models/BookmarkModel");
const SmartNetworkModel = require("../../models/SmartNetworkModel");

const likeSmartNetworkPost = async (results) => {
  const postID = results.postID;
  const userID = results.userID;

  const myLike = {
    user: userID,
  };

  const like = await SmartNetworkModel.findOneAndUpdate(
    { _id: postID },
    { $push: { likes: myLike } }
  );
  if (like) console.log("Liked");
};

const unlikeSmartNetworkPost = async (results) => {
  const postID = results.postID;
  const userID = results.userID;

  const myLike = {
    user: userID,
  };

  const unlike = await SmartNetworkModel.findOneAndUpdate(
    { _id: postID },
    { $pull: { likes: myLike } }
  );
  if (unlike) console.log("Unliked");
};

const bookmarkSmartNetworkPost = async (results) => {
  const postID = results.postID;
  const userID = results.userID;

  const checkUser = await BookmarkModel.find({ user: userID });

  if (checkUser) {
    const bookmark = await BookmarkModel.findOneAndUpdate(
      { user: userID },
      { $push: { posts: { postID } } }
    );
    if (bookmark) console.log("Bookmarked b2");
  } else {
    const bookmark = await BookmarkModel.create({
      user: userID,
      posts: [{ postID }],
    });
    if (bookmark) console.log("Bookmarked");
  }
};

const unbookmarkSmartNetworkPost = async (results) => {
  const postID = results.postID;
  const userID = results.userID;

  const unbookmark = await BookmarkModel.findOneAndUpdate(
    { user: userID },
    { $pull: { posts: { postID } } }
  );
  if (unbookmark) console.log("Unbookmarked");
};

// const postCommentsOnSmartNetworkPosts = ;

// const showRepliesOnACommentOnSmartNetworkPosts = ;

const postRepliesOnACommentOnSmartNetworkPosts = async (moreComments) => {
  const postID = moreComments.postID;
  const commentID = moreComments.commentID;
  const myReply = moreComments.myReply;
  const myID = moreComments.user;
  const uniqID = moreComments.uniqID;

  const myDetails = await AuthModel.findById(myID);

  const myAvatar = myDetails.avatar;
  const myUsername = myDetails.username;

  const moreComment = {
    moreUser: myID,
    moreUsername: myUsername,
    moreUserAvatar: myAvatar,
    moreUserMessage: myReply,
    datePosted: new Date(),
  };

  const postMyComment = await SmartNetworkModel.findOneAndUpdate(
    { _id: postID, "comments._id": commentID },
    { $push: { "comments.$.moreComments": moreComment } },
    {
      returnOriginal: false,
    }
  );

  if (postMyComment) console.log("Reply posted");
};

module.exports = {
  likeSmartNetworkPost,
  unlikeSmartNetworkPost,
  bookmarkSmartNetworkPost,
  unbookmarkSmartNetworkPost,
  // postCommentsOnSmartNetworkPosts,
  // showRepliesOnACommentOnSmartNetworkPosts,
  postRepliesOnACommentOnSmartNetworkPosts,
};
