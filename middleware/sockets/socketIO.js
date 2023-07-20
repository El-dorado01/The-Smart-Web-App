// Models
const AuthModel = require("../../models/AuthModel");
const MoviesModel = require("../../models/MoviesModel");
const PlaylistsModel = require("../../models/PlaylistsModel");
const SmartNetworkModel = require("../../models/SmartNetworkModel");
const MeetingsModel = require("../../models/MeetingsModel");
const FeedpostModel = require("../../models/FeedpostModel");
const ForumsModel = require("../../models/ForumsModel");
const ForumRankingsModel = require("../../models/ForumRankingsModel");
const ForumNotificationsModel = require("../../models/ForumNotificationsModel");
const NotificationsModel = require("../../models/NotificationsModel");
const FindMatesModel = require("../../models/FindMatesModel");
const StoreProductsModel = require("../../models/StoreProductsModel");
const MarketStoresModel = require("../../models/MarketStoresModel");
const BuyersModel = require("../../models/BuyersModel");

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const asyncWrapper = require("../async");

const { room } = require("../../controllers/dashboard/private/liveMeeting");

const {
  likeSmartNetworkPost,
  unlikeSmartNetworkPost,
  bookmarkSmartNetworkPost,
  unbookmarkSmartNetworkPost,
  postRepliesOnACommentOnSmartNetworkPosts,
} = require("./SmartNetwork");

const {
  addMovieToUsersPlaylist,
  deleteMovie,
  postCommentsOnMovie,
  deletePlaylist,
  removeAMovieFromAPlaylist,
  subscribeToAMovieChannel,
  unsubscribeFromAMovieChannel,
  likeAMovie,
  unlikeAMovie,
  removeAMovieFromLikedVideos,
  removeAMovieFromDislikedVideos,
  likeACommentOnAMovie,
  unlikeACommentOnAMovie,
  postAReplyOnACommentOnAMovie,
} = require("./Movies");

const { cancelAMeeting, endAMeeting } = require("./LiveMeeting");

const {
  sendAFriendRequest,
  cancelASentRequest,
  acceptAFriendRequest,
  declineAFriendRequest,
  deleteDeclinedRequests,
  blockAUser,
  unblockAUser,
} = require("./Friends");

const { lockScreen } = require("./LockScreen");

const {
  // deleteATopicAsModerator,
  updateResponseUpvotes,
  updateTopicUpvotes,
  updateTopicBookmarks,
} = require("./Forum");

const {
  updateAccountStatus,
  removeMatesFromSuggestion,
  updateMatchRequests,
  getUserLocation,
} = require("./FindMates");

const {
  deleteAProductFromStore,
  updateProductFavouritesAndCarts,
  rateAStore,
  deleteProductReview,
  makeOrder,
} = require("./Marketplace");
const ForumsTopicsModel = require("../../models/ForumsTopicsModel");

// const { Peer } = require("peer");
var channels = {};
var sockets = {};

const allSockets = (socket) => {
  console.log("New WS connection");

  /*
  =======================================================================================
  ************************************SMART NETWORK**************************************
  //Like Smart Network Posts
  //Unlike Smart Network Posts
  //Bookmark Smart Network Posts
  //Unbookmark Smart Network Posts
  //Post Comments on Smart Network Posts - Recieves comments from the client side and update them in the database
  //Show Replies on a Comment on Smart Network Posts - Fetch replies on a comment from database
  //Post Replies on a Comment on Smart Network Posts - Receives comments from the client side and update them in the database
  =======================================================================================
  */
  socket.on("likePost", likeSmartNetworkPost);
  socket.on("unlikePost", unlikeSmartNetworkPost);
  socket.on("bookmarkPost", bookmarkSmartNetworkPost);
  socket.on("unBookmarkPost", unbookmarkSmartNetworkPost);
  socket.on("postComments", async (comment) => {
    const postID = comment.postID;
    const myReply = comment.myReply;
    const myID = comment.user;

    const myDetails = await AuthModel.findById(myID);

    const myAvatar = myDetails.avatar;
    const myUsername = myDetails.username;

    const uniqID = uuidv4();

    const myComment = {
      user: myID,
      username: myUsername,
      avatar: myAvatar,
      message: myReply,
      uniqID: uniqID,
      datePosted: new Date(),
    };

    const postMyComment = await SmartNetworkModel.findOneAndUpdate(
      { _id: postID },
      { $push: { comments: myComment } },
      {
        returnOriginal: false,
      }
    );

    if (postMyComment) console.log("comment posted");

    //Send posted comments back to the user
    socket.emit("feedPostComments", postMyComment);
    // socket.emit("singleFeedPostComments", postMyComment);
  });
  // socket.on("singlePostComments");
  socket.on("showReplies", async (replies) => {
    const postID = replies.postID;
    const commentID = replies.commentID;
    const uniqID = replies.uniqID;
    const myID = replies.user;

    const commentReplies = await SmartNetworkModel.findOne({
      _id: postID,
      "comments._id": commentID,
    });

    var result = commentReplies.comments.filter((obj) => {
      return obj.uniqID === uniqID;
    });

    socket.emit("replyRoom", { postID, result });
  });
  socket.on("postMoreComments", postRepliesOnACommentOnSmartNetworkPosts);

  /*
  =======================================================================================
  ************************************MOVIES TAB*****************************************
  -----------------------------Movies----------------------------
  //Open Movies Tab
  //Delete Movie
  //Like a Movie
  //Unlike a Movie
  //Remove a Movie From Liked Video
  //Remove a Movie From Disliked Video
  -----------------------------Comments & Replies----------------------------
  //Show Comments On a Movie
  //Like a Comment on a Movie
  //Unlike a Comment on a Movie
  //Post Comments on Movies - Receives a movie's comments from the client side and update them in the database
  //Post a Reply Under a Comment On a Movie - Receives a reply on a movie's comments from the client side and update them in the database
  -----------------------------Playlists----------------------------
  //Create Channel Playlist
  //Create Channel Playlist and Add a Movie
  //Create User Playlist
  //Create User Playlist and Add a Movie
  //Add Movies to Channel Playlist
  //Add Movies to User Playlist
  //Show Movies in a Playlist
  //Delete or Remove a Movie From a Playlist
  //Delete Playlist
  -----------------------------Channels----------------------------
  //Subscribe to a Movie Channel
  //Unsubscribe from a Movie Channel
  =======================================================================================
  */
  socket.on("openMoviesTab", async (obj) => {
    if (obj === "All") {
      const newMovies = await MoviesModel.find({}).sort("-createdAt");
      socket.emit("newMoviesTab", newMovies);
    } else {
      const filterValue = obj.toLowerCase();
      const newMovies = await MoviesModel.find({
        category: { $regex: filterValue },
      }).sort("-createdAt");
      socket.emit("newMoviesTab", newMovies);
    }
  });
  socket.on("postPlaylist", async (response) => {
    const playlist = await PlaylistsModel.create({
      playlistName: response.playlistName,
      channelID: response.channelID,
    });

    socket.emit("getPlaylist", playlist);
  });
  socket.on("postUserPlaylist", async (response) => {
    const playlist = await PlaylistsModel.create({
      playlistName: response.playlistName,
      userID: response.userID,
    });

    if (playlist) console.log("Playlist created");

    socket.emit("getUserPlaylist", playlist);
  });
  socket.on("addVideoToPlaylist", async (response) => {
    const movie = await MoviesModel.findOne({
      _id: response.movieID,
    });

    const movieDetails = {
      movieID: movie._id,
      thumbnail: movie.thumbnail,
      channel: movie.channel,
      title: movie.title,
    };

    await PlaylistsModel.findOneAndUpdate(
      { _id: response.playlistID },
      { $push: { movies: movieDetails } }
    );

    const playlist = await PlaylistsModel.find({
      channelID: response.channelID,
    }).sort("-createdAt");

    if (playlist) console.log("Added to Playlist");

    socket.emit("getMovieAddedToPlaylist", playlist);
  });
  socket.on("addVideoToUserPlaylist", addMovieToUsersPlaylist);
  socket.on("createPlaylistAndAddVideo", async (response) => {
    const movie = await MoviesModel.findOne({
      _id: response.movieID,
    });

    const movieDetails = {
      movieID: movie._id,
      thumbnail: movie.thumbnail,
      channel: movie.channel,
      title: movie.title,
    };

    const playlist = await PlaylistsModel.create({
      playlistName: response.playlistName,
      channelID: response.channelID,
      movies: movieDetails,
    });

    if (playlist) console.log("Playlist created and video has been added");

    socket.emit("getCreatePlaylistAndAddVideo", playlist);
  });
  socket.on("createUserPlaylistAndAddVideo", async (response) => {
    const movie = await MoviesModel.findOne({
      _id: response.movieID,
    });

    const movieDetails = {
      movieID: movie._id,
      thumbnail: movie.thumbnail,
      channel: movie.channel,
      title: movie.title,
    };

    const playlist = await PlaylistsModel.create({
      playlistName: response.playlistName,
      userID: response.userID,
      movies: movieDetails,
    });

    if (playlist) console.log("Playlist created and video has been added");

    socket.emit("getCreateUserPlaylistAndAddVideo", playlist);
  });
  socket.on("deleteMovie", deleteMovie);
  socket.on("postMovieComments", postCommentsOnMovie);
  socket.on("subscribe", subscribeToAMovieChannel);
  socket.on("unSubscribe", unsubscribeFromAMovieChannel);
  socket.on("deletePlaylist", deletePlaylist);
  socket.on("showPlaylistVideos", async (response) => {
    const videosInPlaylist = await PlaylistsModel.findById({ _id: response });

    socket.emit("receiveShowPlaylistVideos", videosInPlaylist);
  });
  socket.on("removeFromPlaylist", removeAMovieFromAPlaylist);
  socket.on("likeVideo", likeAMovie);
  socket.on("dislikeVideo", unlikeAMovie);
  socket.on("removeLikeVideo", removeAMovieFromLikedVideos);
  socket.on("removeDislikeVideo", removeAMovieFromDislikedVideos);
  socket.on("showVideoReplies", async (replies) => {
    const movieID = replies.movieID;
    const commentID = replies.commentID;
    const uniqID = replies.uniqID;
    const myID = replies.userID;

    const commentReplies = await MoviesModel.findOne({
      _id: movieID,
      "comments._id": commentID,
    });

    var result = commentReplies.comments.filter((obj) => {
      return obj.uniqID === uniqID;
    });

    socket.emit("replyVideoRoom", { movieID, result });
  });
  socket.on("likeComment", likeACommentOnAMovie);
  socket.on("unlikeComment", unlikeACommentOnAMovie);
  socket.on("postMoreVideoComments", postAReplyOnACommentOnAMovie);

  /*
  =======================================================================================
  ************************************LIVE MEETING***************************************
  //Show Information about a Meeting
  //Cancel or Delete a Meeting
  //Start Meeting - Interact with database and start meeting.
  //Join Meeting
  //End Meeting - Interact with database and end meeting.
  =======================================================================================
  */
  socket.on("showMeetingDetails", async (roomID) => {
    const meetingDetails = await MeetingsModel.findById({ _id: roomID });
    socket.emit("getMeetingDetails", meetingDetails);
  });
  socket.on("cancelMeeting", cancelAMeeting);
  socket.on("startMyRoom", async (roomID) => {
    //Interact with database and start meeting.
    await MeetingsModel.findByIdAndUpdate({ _id: roomID }, { status: "start" });
    socket.emit("youCanStart", roomID);
  });
  socket.on("joinRoom", async (roomID, userID) => {
    var status;
    var host;
    try {
      const result = await MeetingsModel.findById({ _id: roomID });
      if (!result) {
        throw new BadRequestError("Error - Room ID does not exist");
      } else {
        if (result != null) {
          status = "success";
        } else {
          status = "failed";
        }
        if (result.Host === userID) {
          host = true;
        } else {
          host = false;
        }
      }
    } catch (error) {
      console.log("ID does not exist");
    }

    //Verify roomID and redirect user
    socket.emit("youCanJoin", { roomID, status, host });
  });
  socket.on("endMeeting", endAMeeting);

  /*
  =======================================================================================
  ************************************FRIENDS TAB****************************************
  //Add a Friend or Send a Friend Request
  //Cancel a Sent Request
  //Accept a Friend Request
  //Decline a Friend Request
  //Delete Declined Requests
  //Block a User
  //Unblock a User
  //Load Contacts and Friend Lists
  =======================================================================================
  */
  socket.on("addFriend", sendAFriendRequest);
  socket.on("cancelRequest", cancelASentRequest);
  socket.on("acceptRequest", acceptAFriendRequest);
  socket.on("declineRequest", declineAFriendRequest);
  socket.on("deleteDeclinedRequest", deleteDeclinedRequests);
  socket.on("blockUserEmit", blockAUser);
  socket.on("unBlockUserEmit", unblockAUser);
  socket.on(
    "loadContacts",
    asyncWrapper(async (id) => {
      let user = await AuthModel.findById(id);

      var contactsArray = [];
      var requestsArray = [];
      var declinedArray = [];
      var blockedArray = [];
      var mayKnow = [];
      var mayKnowArray = [];
      for (let i = 0; i < user.friends.length; i++) {
        //Case One
        if (user.friends[i].status === "accepted") {
          var a = await AuthModel.findById(
            user.friends[i].userID,
            "username avatar about email"
          );
          contactsArray.push({
            sender: user.friends[i].sender,
            details: a,
          });
        }

        //Case Two
        if (user.friends[i].status === "pending") {
          var a = await AuthModel.findById(
            user.friends[i].userID,
            "username avatar about email"
          );
          requestsArray.push({
            sender: user.friends[i].sender,
            details: a,
          });
        }

        //Case Three
        if (user.friends[i].status === "declined") {
          var a = await AuthModel.findById(
            user.friends[i].userID,
            "username avatar about email"
          );
          declinedArray.push({
            sender: user.friends[i].sender,
            id: user.friends[i]._id,
            details: a,
          });
        }

        //Case Four
        if (
          user.friends[i].block === true &&
          user.friends[i].blocker === req.user.userId.toString()
        ) {
          var a = await AuthModel.findById(
            user.friends[i].userID,
            "username avatar about email"
          );
          blockedArray.push({
            sender: user.friends[i].sender,
            details: a,
          });
        }
      }

      if (user.friends.length > 0) {
        //Who You May Know
        var b = await AuthModel.findById(user.friends[i].userID, "friends");

        b.friends.forEach(async (item) => {
          if (!mayKnow.includes(item.userID)) {
            mayKnow.push(item.userID);
          }
        });
      }

      function getRandom(arr, num) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
      }
      const mayKnowArrays = getRandom(mayKnow, 20);

      for (let i = 0; i < mayKnowArrays.length; i++) {
        var a = await AuthModel.findById(
          mayKnowArrays[i],
          "username avatar about email"
        );
        mayKnowArray.push(a);
      }

      if (contactsArray.length <= 0) {
        contactsArray = "empty";
      }
      if (requestsArray.length <= 0) {
        requestsArray = "empty";
      }
      if (declinedArray.length <= 0) {
        declinedArray = "empty";
      }
      if (blockedArray.length <= 0) {
        blockedArray = "empty";
      }
      if (mayKnowArray.length <= 0) {
        mayKnowArray = "empty";
      }

      socket.emit(
        "contactsReady",
        contactsArray,
        requestsArray,
        declinedArray,
        blockedArray,
        mayKnowArray
      );
    })
  );

  /*
  =======================================================================================
  ************************************LOCKSCREEN*****************************************
  //Lock screen
  //Unlock screen - User unlocks screen using password
  =======================================================================================
  */
  socket.on("lockscreen", lockScreen);
  socket.on("unlockScreen", async (response) => {
    const user = await AuthModel.findById(response.userID);
    const isPasswordCorrect = await user.validatePassword(response.password);

    if (!isPasswordCorrect) {
      socket.emit("passwordStatus", "invalid");
    } else {
      await AuthModel.findOneAndUpdate(
        { _id: response.userID },
        { lockScreen: false }
      );
      socket.emit("passwordStatus", "valid");
    }
  });

  /*
 =======================================================================================
 ************************************FEED POSTS*****************************************
 //Show Post Drafts
 //
 =======================================================================================
 */
  socket.on("showDrafts", async (userID) => {
    var drafts = await FeedpostModel.find({
      poster: userID,
      saved: true,
    });

    socket.emit("draftsFetched", drafts);
  });

  socket.on("fetchDraft", async (threadID) => {
    var draft = await FeedpostModel.find({
      threadID,
    });

    // console.log(draft);
    socket.emit("displayDraft", draft);
  });

  /*
 =======================================================================================
 ************************************FORUMS TAB*****************************************
 //Delete a topic from a forum
 //Update topic upvotes (add and remove upvotes)
 //Update topic bookmarks (add and remove topic from bookmarks)
 //Update response upvotes (add and remove upvotes)
 //Fetch info about a forum
 =======================================================================================
 */
  // socket.on("deleteATopic", deleteATopicAsModerator);
  socket.on("updateResponseUpvotes", updateResponseUpvotes);
  socket.on("updateTopicUpvotes", updateTopicUpvotes);
  socket.on("updateTopicBookmarks", updateTopicBookmarks);
  socket.on("copyForumInviteLink", async (data) => {
    const { secretKey, forumID, link } = data;
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(secretKey, salt);

    var newLink = link + hashedKey;
    socket.emit("inviteLinkHashed", hashedKey, forumID, newLink);
  });
  socket.on("resetForumRanks", async (data) => {
    const { forumID } = data;

    const ranksReset = await ForumRankingsModel.findOneAndUpdate(
      { forumID },
      {
        newbie: {
          minUpvotesRequired: 0
        },
        rookie: {
          minUpvotesRequired: 5
        },
        apprentice: {
          minUpvotesRequired: 15
        },
        explorer: {
          minUpvotesRequired: 30
        },
        contributor: {
          minUpvotesRequired: 50
        },
        enthusiast: {
          minUpvotesRequired: 75
        },
        collaborator: {
          minUpvotesRequired: 105
        },
        communityRegular: {
          minUpvotesRequired: 140
        },
        risingStar: {
          minUpvotesRequired: 180
        },
        proficient: {
          minUpvotesRequired: 225
        },
        experienced: {
          minUpvotesRequired: 275
        },
        mentor: {
          minUpvotesRequired: 330
        },
        veteran: {
          minUpvotesRequired: 400
        },
        master: {
          minUpvotesRequired: 500
        },
        grandmaster: {
          minUpvotesRequired: 750
        },
        legendary: {
          minUpvotesRequired: 1500
        },
      }
    )

    if (ranksReset) {
      console.log("Forum " + forumID + " ranks have been reset to default");
      socket.emit("ranksReset", { success: true, msg: "Forum Ranks have been reset" });
    }
  })
  socket.on("fetchAForumInfo", async (data) => {
    const { forumID, userID } = data;

    const forumInfo = await ForumsModel.findById({ _id: forumID });

    const forumRanks = await ForumRankingsModel.findOne({ forumID });
    let incomingInvites = [];
    let forumMembers = [];

    var allInvites = forumInfo.invites;
    for (let i = 0; i < allInvites.length; i++) {
      if (allInvites[i].incoming == true) {
        var newMemberInfo = await AuthModel.findById(
          allInvites[i].userID,
          "username avatar about email"
        );
        incomingInvites.push({ member: newMemberInfo });
      }
    }

    for (let a = 0; a < forumInfo.members.length; a++) {
      if (forumInfo.members[a].memberStatus == "active") {
        var memberInfo = await AuthModel.findById(
          forumInfo.members[a].userID,
          "username avatar about email"
        );
        forumMembers.push({ member: forumInfo.members[a], memberInfo });
      }
    }

    const creatorDetails = await AuthModel.findById(
      forumInfo.creator,
      "username avatar about email"
    );

    let numberOfPosts = 0;
    const forumTopics = await ForumsTopicsModel.find({ forumID });

    //Count Number of user's posts
    for (let i = 0; i < forumTopics.length; i++) {
      if (forumTopics[i].userID == userID) {
        numberOfPosts++;
      }
      for (let a = 0; a < forumTopics[i].responses.length; a++) {
        if (forumTopics[i].responses[a].userID == userID) {
          numberOfPosts++;
        }
      }
    }

    socket.emit(
      "aForumInfo",
      forumInfo,
      forumRanks,
      incomingInvites,
      forumMembers,
      creatorDetails,
      numberOfPosts
    );
  });
  socket.on("getTopicCategories", async (data) => {
    const { forumID } = data;
    var latestTopics = [];
    var pinnedTopics = []; 
    var trendingTopics = [];

    const forumMembers = await ForumsModel.findById(
      forumID,
      "creator members ownerUpvotes"
    );

    const latestTopicsFetched = await ForumsTopicsModel.find({ forumID })
      .limit(5).sort("-createdAt");

    for (let i = 0; i < latestTopicsFetched.length; i++) {
      const userInfo = await AuthModel.findById(
        latestTopicsFetched[i].userID,
        "username avatar about email"
      );
      if (latestTopicsFetched[i].userID == forumMembers.creator) {
        latestTopics.push({
          topic: latestTopicsFetched[i],
          userInfo,
          memberUpvotes: forumMembers.ownerUpvotes,
        });
      } else {
        for (let i = 0; i < forumMembers.members.length; i++) {
          const member = forumMembers.members[i];

          if (latestTopicsFetched[i].userID == member.userID) {
            latestTopics.push({
              topic: latestTopicsFetched[i],
              userInfo,
              memberUpvotes: member.upvotes,
            });
          }
        }
      }
    }

    const pinnedTopicsFetched = await ForumsTopicsModel.find({ forumID, pinned: true })
      .limit(15).sort("-createdAt");

    for (let i = 0; i < pinnedTopicsFetched.length; i++) {
      const userInfo = await AuthModel.findById(
        pinnedTopicsFetched[i].userID,
        "username avatar about email"
      );
      if (pinnedTopicsFetched[i].userID == forumMembers.creator) {
        pinnedTopics.push({
          topic: pinnedTopicsFetched[i],
          userInfo,
          memberUpvotes: forumMembers.ownerUpvotes,
        });
      } else {
        for (let i = 0; i < forumMembers.members.length; i++) {
          const member = forumMembers.members[i];

          if (pinnedTopicsFetched[i].userID == member.userID) {
            pinnedTopics.push({
              topic: pinnedTopicsFetched[i],
              userInfo,
              memberUpvotes: member.upvotes,
            });
          }
        }
      }
    }

    const trendingTopicsFetched = await ForumsTopicsModel.find({ forumID, __v: { $ne: 0 } })
      .limit(5).sort("-__v");

    for (let i = 0; i < trendingTopicsFetched.length; i++) {
      const userInfo = await AuthModel.findById(
        trendingTopicsFetched[i].userID,
        "username avatar about email"
      );

      if (trendingTopicsFetched[i].userID == forumMembers.creator) {
        trendingTopics.push({
          topic: trendingTopicsFetched[i],
          userInfo,
          memberUpvotes: forumMembers.ownerUpvotes,
        });
      } else {
        for (let i = 0; i < forumMembers.members.length; i++) {
          const member = forumMembers.members[i];

          if (trendingTopicsFetched[i].userID == member.userID) {
            trendingTopics.push({
              topic: trendingTopicsFetched[i],
              userInfo,
              memberUpvotes: member.upvotes,
            });
          }
        }
      }
    }

    socket.emit("topicCategories", { latestTopics, pinnedTopics, trendingTopics });
  });
  socket.on("getNewPageTopics", async (data) => {
    const { requestedPage, incomingTotalPages, forumID } = data;
    const page = parseInt(requestedPage);
    const totalPages = parseInt(incomingTotalPages);

    // return;
    // var totalPages = 2;
    // const page = 1;
    let nextPage;
    let previousPage;
    const limit = 15;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    const topics = [];
    const newTopics = await ForumsTopicsModel.find({ forumID })
      .limit(limit)
      .skip(startIndex)
      .sort("-createdAt");

    if (page < totalPages) {
      nextPage = page + 1;
    } else {
      nextPage = 0;
    }
    if (startIndex > 0) {
      previousPage = page - 1;
    } else {
      previousPage = 0;
    }

    const forumMembers = await ForumsModel.findById(
      forumID,
      "creator members ownerUpvotes"
    );
    for (let i = 0; i < newTopics.length; i++) {
      const userInfo = await AuthModel.findById(
        newTopics[i].userID,
        "username avatar about email"
      );
      if (newTopics[i].userID == forumMembers.creator) {
        topics.push({
          topic: newTopics[i],
          userInfo,
          memberUpvotes: forumMembers.ownerUpvotes,
        });
      } else {
        for (let i = 0; i < forumMembers.members.length; i++) {
          const member = forumMembers.members[i];

          if (newTopics[i].userID == member.userID) {
            topics.push({
              topic: newTopics[i],
              userInfo,
              memberUpvotes: member.upvotes,
            });
          }
        }
      }
    }

    socket.emit("newTopics", topics, page, totalPages, nextPage, previousPage);

    // topics.results = model.slice(startIndex, endIndex);
  });
  socket.on("warns", async (data) => {
    const { id, forumID, memberID, topicID, deletionType, responseID } = data

    const forumInfo = await ForumsModel.findById({ _id: forumID });
    const forumOwner = forumInfo.creator;
    var memberWarnNumber;
    forumInfo.members.forEach(member => {
      if (member.userID == memberID) {
        memberWarnNumber = 5 - member.numberOfWarns;
      }
    });

    socket.emit("hereIsTheNumberOfWarns", { memberWarnNumber, id, forumID, memberID, topicID, deletionType, responseID });
  });
  socket.on("performActionInForum", async (data) => {
    const { forumID, topicID, actionType, isAModerator } = data;

    switch (actionType) {
      case "pinDiscussion":
        var discussionPinned = await ForumsTopicsModel.findByIdAndUpdate(
          { _id: topicID },
          {
            pinned: 1
          });

        if (discussionPinned) {
          console.log("Discussion pinned!")
          socket.emit("actionDone", { success: true, actionType, forumID, topicID, isAModerator })
        }
        break;
      case "unpinDiscussion":
        var discussionPinned = await ForumsTopicsModel.findByIdAndUpdate(
          { _id: topicID },
          {
            pinned: 0
          });

        if (discussionPinned) {
          console.log("Discussion has been unpinned!")
          socket.emit("actionDone", { success: true, actionType, forumID, topicID, isAModerator })
        }
        break;
      case "closeDiscussion":
        var discussionClosed = await ForumsTopicsModel.findByIdAndUpdate(
          { _id: topicID },
          {
            discussionClosed: 1
          });

        if (discussionClosed) {
          console.log("Discussion closed!")
          socket.emit("actionDone", { success: true, actionType, forumID, topicID, isAModerator })
        }
        break;

      default:
        var discussionOpened = await ForumsTopicsModel.findByIdAndUpdate(
          { _id: topicID },
          {
            discussionClosed: 0
          });

        if (discussionOpened) {
          console.log("Discussion opened!")
          socket.emit("actionDone", { success: true, actionType, forumID, topicID, isAModerator })
        }
        break;
    }
  })
  socket.on("subscribeToForumNotifications", async (data) => {
    const { forumID, userID, subscriptionType, actionType } = data;
    switch (actionType) {
      case "subscribe":
        const subscription = await ForumNotificationsModel.findOne({
          forumID,
          "notificationSubscribers.userID": userID
        });
        if(subscription) {
          // Update user's subscription type
          var subscriptionUpdated = await ForumNotificationsModel.findOneAndUpdate(
            { forumID, "notificationSubscribers.userID": userID },
            {
              $set: {
                "notificationSubscribers.$.subscriptionType": subscriptionType,
              },
            }
          );

          if(subscriptionUpdated) {
            // Subscription Type updated
            console.log("Subscription Type updated");
          }
        }else{
          var subscriptionCreated = await ForumNotificationsModel.findOneAndUpdate(
            { forumID },
            { $push: { notificationSubscribers: { userID, subscriptionType } } }
          )
          
          if(subscriptionCreated) {
            // New susbcription created
            console.log("New susbcription created");
          }
        }
        break;
    
      default:
        // Unsubscribe from forum notifications by default
        var unsubscribed = await ForumNotificationsModel.findOneAndUpdate(
          { forumID, "notificationSubscribers.userID": userID },
          {
            $pull: { notificationSubscribers: { userID } },
          }
        );

        if(unsubscribed){
          // User has unsubscribed from forum notifications
          console.log("User has unsubscribed from forum notifications");
        }
        break;
    }
  });
  socket.on("subscribeToForumPushNotifications", async (data) => {
    const { forumID, userID, actionType, subscription } = data

    console.log(data);

    switch (actionType) {
      case "subscribe":
        var subscribed = await ForumNotificationsModel.findOneAndUpdate(
          { forumID, "notificationSubscribers.userID": userID },
          { 
            $set: { "notificationSubscribers.$.enablePushNotifications": true },
            $push: { "notificationSubscribers.$.pushNotifications": subscription },
          }
        );

        if(subscribed){
          // User has subscribed to push notifications
          console.log("User has subscribed to push notifications");
        }
        break;
    
      default:
        // Unsubscribe by default
        var unsubscribed = await ForumNotificationsModel.findOneAndUpdate(
          { forumID, "notificationSubscribers.userID": userID },
          { 
            $set: { "notificationSubscribers.$.enablePushNotifications": false },
            $pull: { "notificationSubscribers.$.pushNotifications": subscription },
          }
        );

        if(unsubscribed){
          // User has unsubscribed from push notifications
          console.log("User has unsubscribed from push notifications");
        }
        break;
    }
  });

  socket.on("updateNotification", async(data) => {
    const notif = await NotificationsModel.findOne({ userID: data.userID })
    var notifications = notif.notifications;
    var foundIndex = notifications.findIndex((notification) => notification == JSON.stringify(data.notification))
    var updatedNotif = data.notification['status'] = "read";
    notifications[foundIndex] = JSON.stringify(data.notification)

    var notificationUpdated = await NotificationsModel.findOneAndUpdate(
      { userID: data.userID },
      { notifications }
    )
    if(notificationUpdated){
      socket.emit("notificationUpdated", data);
    }
  })

  /*
 =======================================================================================
 ************************************FIND MATES*****************************************
  //Activate and deactivate profile
  //Remove mates from suggestions
  //Send and accept a match request
  //Delete a match request after 24 hours
  //Filter Mate Search based age and gender
  //Get Nearby mates
  //Add and remove mates from favourites
 =======================================================================================
 */
  socket.on("updateAccountStatus", updateAccountStatus);
  socket.on("updateMatchRequests", updateMatchRequests);
  socket.on("removeMatesFromSuggestion", removeMatesFromSuggestion);
  socket.on("getUserLocation", getUserLocation);
  socket.on("filterMateSearch", async (data) => {
    const { filterValues, filterOption } = data;
    let filterResults;
    let filterResultsForAgeRange = [];

    switch (filterOption) {
      case "ageOnlyLessThan23":
        filterResults = await FindMatesModel.find({ age: { $lte: 23 } });
        if (filterResults)
          console.log(
            "Filter results for ageOnlyLessThan23 fetched successfully!"
          );
        break;

      case "ageOnly23To30":
        var profiles = await FindMatesModel.find({});
        for (let i = 0; i < profiles.length; i++) {
          const profile = profiles[i];

          if (profile.age > 23 && profile.age < 30) {
            filterResultsForAgeRange.push(profile);
          }
        }
        break;

      case "ageOnlyGreaterThan30":
        filterResults = await FindMatesModel.find({ age: { $gte: 30 } });
        if (filterResults)
          console.log(
            "Filter results for ageOnlyGreaterThan30 fetched successfully!"
          );
        break;

      case "ageLessThan23AndGender":
        filterResults = await FindMatesModel.find({
          $and: [{ age: { $lte: 30 } }, { gender: filterValues.gender }],
        });
        if (filterResults)
          console.log(
            "Filter results for ageLessThan23AndGender fetched successfully!"
          );
        break;

      case "age23To30AndGender":
        var profiles = await FindMatesModel.find({
          gender: filterValues.gender,
        });
        for (let i = 0; i < profiles.length; i++) {
          const profile = profiles[i];

          if (profile.age > 23 && profile.age < 30) {
            filterResultsForAgeRange.push(profile);
          }
        }
        break;

      case "ageGreaterThan30AndGender":
        filterResults = await FindMatesModel.find({
          $and: [{ age: { $gte: 30 } }, { gender: filterValues.gender }],
        });
        if (filterResults)
          console.log(
            "Filter results for ageGreaterThan30AndGender fetched successfully!"
          );
        break;

      case "genderOnly":
        filterResults = await FindMatesModel.find({
          gender: filterValues.gender,
        });
        if (filterResults)
          console.log(
            "Filter results for gender: " +
            filterValues.gender +
            " fetched successfully!"
          );
        break;

      default:
        //Fetch all mates without filter by default
        filterResults = await FindMatesModel.find({});
        if (filterResults)
          console.log("Filter results for no filter fetched successfully!");
        break;
    }

    if (
      filterOption == "ageOnly23To30" ||
      filterOption == "age23To30AndGender"
    ) {
      socket.emit("filterMateSearchResults", filterResultsForAgeRange);
    } else {
      socket.emit("filterMateSearchResults", filterResults);
    }
  });
  socket.on("updateFavouritedMates", async (data) => {
    const { profileID, mateProfileID, actionType } = data;

    switch (actionType) {
      case "addToFavourite":
        const addedToFavourite = await FindMatesModel.findByIdAndUpdate(
          { _id: profileID },
          { $push: { favouriteMates: { userID: mateProfileID } } }
        );

        if (addedToFavourite)
          console.log(
            "Mate " + mateProfileID + " has been added to your favourites!"
          );

        socket.emit("newFavouritedMates", addedToFavourite);
        break;

      default:
        //Remove mates from favourites by default
        const removedFromFavourite = await FindMatesModel.findByIdAndUpdate(
          { _id: profileID },
          { $pull: { favouriteMates: { userID: mateProfileID } } }
        );

        if (removedFromFavourite)
          console.log(
            "Mate " + mateProfileID + " has been removed from your favourites!"
          );

        socket.emit("newFavouritedMates", removedFromFavourite);
        break;
    }
  });
  socket.on("fetchAllMates", async (data) => {
    const { profileID } = data;
    let allMates = [];
    let favouriteMates = [];
    let matchedMates = [];
    let mateMatchRequests = [];

    const profileInfo = await FindMatesModel.findOne({ _id: profileID });

    for (let a = 0; a < profileInfo.favouriteMates.length; a++) {
      const fetchedFavouriteMates = await FindMatesModel.findOne({
        userID: profileInfo.favouriteMates[a].userID,
      });

      favouriteMates.push(fetchedFavouriteMates);
    }

    for (let b = 0; b < profileInfo.matchedMates.length; b++) {
      const fetchedMatchedMates = await FindMatesModel.findOne({
        userID: profileInfo.matchedMates[b].userID,
      });

      matchedMates.push(fetchedMatchedMates);
    }

    for (let c = 0; c < profileInfo.mateMatchRequests.length; c++) {
      const fetchedMateMatchRequests = await FindMatesModel.findOne({
        userID: profileInfo.mateMatchRequests[c].userID,
      });

      mateMatchRequests.push(fetchedMateMatchRequests);
    }

    //Do not fetch that have been removed from suggestions and mates that have been matched already
    const fetchAllMates = await FindMatesModel.find({}).where({
      $and: [
        {
          accountStatus: true,
        },
        {
          userStatus: true,
        },
      ],
    });
    for (let i = 0; i < fetchAllMates.length; i++) {
      for (let a = 0; a < profileInfo.removeMatesFromSuggestion.length; a++) {
        for (let b = 0; b < profileInfo.matchedMates.length; b++) {
          if (
            fetchAllMates[i].userID !=
            profileInfo.removeMatesFromSuggestion[a].userID ||
            fetchAllMates[i].userID != profileInfo.matchedMates[b].userID
          ) {
            allMates.push(fetchAllMates[i]);
          }
        }
      }
    }

    socket.emit(
      "allMates",
      allMates,
      favouriteMates,
      matchedMates,
      mateMatchRequests
    );
  });

  /*
 =======================================================================================
 ************************************MARKET PLACE*****************************************
  //Delete a product from store
  //Fetch all orders
  //Mark order as completed
  //Add products to favourites and cart
  //Rate a store
  //Add and delete product review
  //Make order
 =======================================================================================
 */

  socket.on("deleteAProductFromStore", deleteAProductFromStore);
  socket.on("updateProductFavouritesAndCarts", updateProductFavouritesAndCarts);
  socket.on("rateAStore", rateAStore);
  socket.on("deleteProductReview", deleteProductReview);
  socket.on("makeOrder", makeOrder);
  socket.on("fetchAllOrders", async (data) => {
    const { userID } = data;

    let allOrders = [];
    const storeInfo = await MarketStoresModel.findOne({ userID });
    const storeID = storeInfo._id;
    const allProducts = await StoreProductsModel.find({ storeID });

    for (let i = 0; i < allProducts.productOrders.length; i++) {
      const element = allProducts.productOrders[i];

      for (let a = 0; a < element.length; a++) {
        if (element.orderStatus == "pending") {
          allOrders.push(element[a]);
        }
      }
    }

    socket.emit("allOrdersFetched", allOrders, allProducts, storeInfo);
  });
  socket.on("markOrderAsCompleted", async (data) => {
    const { storeID, userID, productID, orderID } = data;

    const storeInfo = await MarketStoresModel.findById(storeID);
    //Check if user is the store owner
    if (userID == storeInfo.userID) {
      const orderCompleted = await StoreProductsModel.findOneAndUpdate(
        { _id: productID, "productOrders.orderID": orderID },
        {
          $set: {
            "productOrders.$.orderStatus": "completed",
            "productOrders.$.dateCompleted": Date.now,
          },
        }
      );
      if (orderCompleted)
        console.log("Order " + orderID + " has been marked as completed");

      socket.emit("orderCompleted", orderCompleted);
    }
  });
  socket.on("loadCartAndFavourites", async (data) => {
    const { userID, actionType } = data;

    const buyersProfile = await BuyersModel.findOne(
      { userID },
      "productFavourites cart"
    );

    switch (actionType) {
      case "loadCart":
        socket.emit("cartAndFavourites", buyersProfile.cart);
        break;

      default:
        //Emit product favourites by default
        socket.emit("cartAndFavourites", buyersProfile.productFavourites);
        break;
    }
  });
  socket.on("addAProductReview", async (data) => {
    const { productID, userID, rating, reviewText } = data;

    if (data.fileUpload) {
      const { fileUpload } = data;
      let fileUploadPath;

      var allowedFiles = fileUpload.mimetype;
      var fileSize = fileUpload.size;
      var maxSize = 5000000;

      if (allowedFiles && allowedFiles.startsWith("image/")) {
        if (fileSize > maxSize) {
          res.send("File is too big");
          uploadOk = 0;
        } else {
          const fileUploadName = uuidv4() + "_" + fileUpload.name.split(".")[0];

          cloudinary.uploader.upload(
            fileUpload.tempFilePath,
            {
              resource_type: "image",
              public_id: `productReviews/${fileUploadName}`,
            },
            async function (err, logo) {
              if (err) {
                console.log(err);
                uploadOk = 0;
              } else {
                fileUploadPath = logo.secure_url;
                uploadOk = 1;

                //Delete file from temp folder
                fs.unlinkSync(fileUpload.tempFilePath);

                const reviewAdded = await MarketStoresModel.findByIdAndUpdate(
                  { _id: productID },
                  {
                    $push: {
                      productRatings: {
                        userID,
                        rating,
                        reviewText,
                        mediaProof: fileUploadPath,
                      },
                    },
                  }
                );

                if (reviewAdded)
                  console.log(
                    "Your review on product " + productID + " has been added!"
                  );

                socket.emit("reviewAdded", reviewAdded);

                //Send success back to frontend
                // res.json({ forumInfo });
              }
            }
          );
        }
      }
    } else {
      const reviewAdded = await MarketStoresModel.findByIdAndUpdate(
        { _id: productID },
        {
          $push: {
            productRatings: {
              userID,
              rating,
              reviewText,
            },
          },
        }
      );

      if (reviewAdded)
        console.log("Your review on product " + productID + " has been added!");
    }
  });
};

module.exports = allSockets;
