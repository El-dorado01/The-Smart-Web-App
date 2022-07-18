// Models
const AuthModel = require("../models/AuthModel");
const BookmarkModel = require("../models/BookmarkModel");
const ChannelsModel = require("../models/ChannelsModel");
const MoviesModel = require("../models/MoviesModel");
const PlaylistsModel = require("../models/PlaylistsModel");
const SmartNetworkModel = require("../models/SmartNetworkModel");
const MeetingsModel = require("../models/MeetingsModel");
const { v4: uuidv4 } = require("uuid");
const { room } = require("../controllers/dashboard/private/liveMeeting");
// const { Peer } = require("peer");
var channels = {};
var sockets = {};

const allSockets = (socket) => {
  console.log("New WS connection");

  //Like Smart Network Posts
  socket.on("likePost", async (results) => {
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
  });

  //Unlike Smart Network Posts
  socket.on("unlikePost", async (results) => {
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
  });

  //Bookmark Smart Network Posts
  socket.on("bookmarkPost", async (results) => {
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
  });

  //Unbookmark Smart Network Posts
  socket.on("unBookmarkPost", async (results) => {
    const postID = results.postID;
    const userID = results.userID;

    const unbookmark = await BookmarkModel.findOneAndUpdate(
      { user: userID },
      { $pull: { posts: { postID } } }
    );
    if (unbookmark) console.log("Unbookmarked");
  });

  //Open Movies Tab
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

  socket.on("addVideoToUserPlaylist", async (response) => {
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
      userID: response.userID,
    }).sort("-createdAt");

    if (playlist) console.log("Added to Playlist");
  });

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

  socket.on("deleteMovie", async (response) => {
    const { movieID } = response;

    // const deleteThumbnail = cloudinary.uploader.destroy(
    //   thumbnailID,
    //   async function (err, result) {
    //     console.log(err);
    //   }
    // );
    // const deleteMovieFile = cloudinary.uploader.destroy(
    //   "SmartMovies/" + fileUploadID,
    //   async function (err, result) {
    //     console.log(err);
    //   }
    // );

    if (deleteMovieFile && deleteThumbnail) {
      const deleteMovie = await MoviesModel.findByIdAndDelete({ _id: movieID });

      if (deleteMovie) console.log("Movie Deleted");
    }
  });

  //Recieves movie comments from the client side and update them in the database
  socket.on("postMovieComments", async (comment) => {
    const movieID = comment.movieID;
    const myReply = comment.myReply;
    const myID = comment.user;

    const myDetails = await AuthModel.findById(myID);

    const myAvatar = myDetails.avatar;
    const myUsername = myDetails.username;

    const uniqID = uuidv4();

    const myComment = {
      userID: myID,
      username: myUsername,
      userAvatar: myAvatar,
      userComment: myReply,
      uniqID: uniqID,
      datePosted: new Date(),
    };

    const postMyComment = await MoviesModel.findOneAndUpdate(
      { _id: movieID },
      { $push: { comments: myComment } }
    );

    if (postMyComment) console.log("comment posted");
  });

  //Recieves comments from the client side and update them in the database
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
  });

  //Recieves comments from the client side and update them in the database
  socket.on("singlePostComments", async (comment) => {
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
    socket.emit("singleFeedPostComments", postMyComment);
  });

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

  //Recieves comments from the client side and update them in the database
  socket.on("postMoreComments", async (moreComments) => {
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

    if (postMyComment) console.log("comment posted");
  });

  socket.on("subscribe", async (response) => {
    const subscriber = {
      userID: response.userID,
    };
    const subscribe = await ChannelsModel.findOneAndUpdate(
      {
        _id: response.channelID,
      },
      { $push: { subscribers: subscriber } }
    );

    if (subscribe) console.log(`Subscribed to ${response.channelID}`);
  });

  socket.on("unSubscribe", async (response) => {
    const subscriber = {
      userID: response.userID,
    };
    const subscribe = await ChannelsModel.findOneAndUpdate(
      {
        _id: response.channelID,
      },
      { $pull: { subscribers: subscriber } }
    );

    if (subscribe) console.log(`Unsubscribed from ${response.channelID}`);
  });

  socket.on("deletePlaylist", async (response) => {
    await PlaylistsModel.findOneAndDelete({ _id: response });

    console.log("Playlist Deleted");
  });

  socket.on("showPlaylistVideos", async (response) => {
    const videosInPlaylist = await PlaylistsModel.findById({ _id: response });

    socket.emit("receiveShowPlaylistVideos", videosInPlaylist);
  });

  socket.on("removeFromPlaylist", async (response) => {
    var a = await PlaylistsModel.findOneAndUpdate(
      {
        _id: response.playlistID,
      },
      { $pull: { movies: { movieID: response.movieID } } }
    );

    if (a) {
      console.log("Video removed from Playlist");
    }
  });

  socket.on("postUserPlaylist", async (response) => {
    const playlist = await PlaylistsModel.create({
      playlistName: response.playlistName,
      userID: response.userID,
    });

    if (playlist) console.log("Playlist created");

    socket.emit("getUserPlaylist", playlist);
  });

  socket.on("likeVideo", async (response) => {
    const movieID = response.movieID;
    const userID = response.userID;

    const myLike = {
      userID,
    };

    //Check if it's among disliked videos
    const checkLikeVideo = await MoviesModel.findOne({
      "dislikes.userID": userID,
    });

    if (checkLikeVideo) {
      await MoviesModel.findOneAndUpdate(
        { _id: movieID },
        { $pull: { dislikes: myLike } }
      );
    }

    const like = await MoviesModel.findOneAndUpdate(
      { _id: movieID },
      { $push: { likes: myLike } }
    );
    if (like) console.log("Liked");
  });

  socket.on("removeLikeVideo", async (response) => {
    const movieID = response.movieID;
    const userID = response.userID;

    const myLike = {
      userID,
    };

    const unlike = await MoviesModel.findOneAndUpdate(
      { _id: movieID },
      { $pull: { likes: myLike } }
    );
    if (unlike) console.log("Unliked");
  });

  socket.on("dislikeVideo", async (response) => {
    const movieID = response.movieID;
    const userID = response.userID;

    const myLike = {
      userID,
    };

    //Check if it's among liked videos
    const checkLikeVideo = await MoviesModel.findOne({
      "likes.userID": userID,
    });

    if (checkLikeVideo) {
      await MoviesModel.findOneAndUpdate(
        { _id: movieID },
        { $pull: { likes: myLike } }
      );
    }

    const dislike = await MoviesModel.findOneAndUpdate(
      { _id: movieID },
      { $push: { dislikes: myLike } }
    );
    if (dislike) console.log("Disliked");
  });

  socket.on("removeDislikeVideo", async (response) => {
    const movieID = response.movieID;
    const userID = response.userID;

    const myLike = {
      userID,
    };

    const unlike = await MoviesModel.findOneAndUpdate(
      { _id: movieID },
      { $pull: { dislikes: myLike } }
    );
    if (unlike) console.log("Removed for disliked");
  });

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

  socket.on("likeComment", async (replies) => {
    const movieID = replies.movieID;
    const commentID = replies.commentID;
    const userID = replies.userID;

    const myLike = {
      userID,
    };

    const like = await MoviesModel.findOneAndUpdate(
      { _id: movieID, "comments._id": commentID },
      { $push: { "comments.$.likes": myLike } }
    );

    if (like) console.log("Comment Liked");
  });

  socket.on("unlikeComment", async (replies) => {
    const movieID = replies.movieID;
    const commentID = replies.commentID;
    const userID = replies.userID;

    const myLike = {
      userID,
    };

    const unlike = await MoviesModel.findOneAndUpdate(
      { _id: movieID, "comments._id": commentID },
      { $pull: { "comments.$.likes": myLike } }
    );

    if (unlike) console.log("Comment Unliked");
  });

  //Recieves comments from the client side and update them in the database
  socket.on("postMoreVideoComments", async (moreComments) => {
    const movieID = moreComments.movieID;
    const commentID = moreComments.commentID;
    const myReply = moreComments.myReply;
    const myID = moreComments.userID;
    const uniqID = moreComments.uniqID;

    const myDetails = await AuthModel.findById(myID);

    const myAvatar = myDetails.avatar;
    const myUsername = myDetails.username;

    const moreComment = {
      userID: myID,
      username: myUsername,
      userAvatar: myAvatar,
      userComment: myReply,
      datePosted: new Date(),
    };

    const postMyComment = await MoviesModel.findOneAndUpdate(
      { _id: movieID, "comments._id": commentID },
      { $push: { "comments.$.moreComments": moreComment } },
      {
        returnOriginal: false,
      }
    );

    if (postMyComment) console.log("comment posted");
  });

  socket.on("showMeetingDetails", async (roomID) => {
    const meetingDetails = await MeetingsModel.findById({ _id: roomID });
    socket.emit("getMeetingDetails", meetingDetails);
  });

  socket.on("cancelMeeting", async (roomID) => {
    const a = await MeetingsModel.findByIdAndDelete({ _id: roomID });
    if (a) console.log("Meeting cancelled");
  });

  socket.on("startMyRoom", async (roomID) => {
    //Interact with database and start meeting.
    await MeetingsModel.findByIdAndUpdate({ _id: roomID }, { status: "start" });
    socket.emit("youCanStart", roomID);
  });

  socket.on("endMeeting", async (roomID) => {
    await MeetingsModel.findByIdAndUpdate({ _id: roomID }, { status: "end" });
  });

  socket.on("joinRoom", async (roomID, userID) => {
    var status;
    var host;
    try {
      const result = await MeetingsModel.findById({ _id: roomID });
      if (!result) {
        throw new Error("error");
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

  socket.on("acceptRequest", async (response) => {
    var a = await AuthModel.findOneAndUpdate(
      { _id: response.userID, "friends.userID": response.id },
      { $set: { "friends.$.status": "accepted" } }
    );
    var b = await AuthModel.findOneAndUpdate(
      { _id: response.id, "friends.userID": response.userID },
      { $set: { "friends.$.status": "accepted" } }
    );
    if (a && b) console.log("Request accepted");
  });

  socket.on("declineRequest", async (response) => {
    var a = await AuthModel.findOneAndUpdate(
      { _id: response.userID, "friends.userID": response.id },
      { $set: { "friends.$.status": "declined" } }
    );
    var b = await AuthModel.findOneAndUpdate(
      { _id: response.id, "friends.userID": response.userID },
      { $set: { "friends.$.status": "declined" } }
    );
    if (a && b) console.log("Request declined");
  });

  socket.on("addFriend", async (response) => {
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
  });

  socket.on("cancelRequest", async (response) => {
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
  });

  socket.on("deleteDeclinedRequest", async (response) => {
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

    console.log("Declined Request Deleted");
  });

  socket.on("blockUserEmit", async (response) => {
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
  });

  socket.on("unBlockUserEmit", async (response) => {
    await AuthModel.findOneAndUpdate(
      { _id: response.userID, "friends.userID": response.friendID },
      { $set: { "friends.$.block": false } }
    );
    await AuthModel.findOneAndUpdate(
      { _id: response.friendID, "friends.userID": response.userID },
      { $set: { "friends.$.block": false } }
    );

    console.log("User unblocked");
  });

  socket.on("loadContacts", async (id) => {
    let user = await AuthModel.findById(id);
    var contactsArray = [];
    var requestsArray = [];
    var declinedArray = [];
    var blockedArray = [];
    var mayKnow = [];
    var mayKnowArray = [];
    for (let i = 0; i < user.friends.length; i++) {
      //Who You May Know
      var b = await AuthModel.findById(user.friends[i].userID, "friends");

      b.friends.forEach(async (item) => {
        if (!mayKnow.includes(item.userID)) {
          mayKnow.push(item.userID);
        }
      });

      //Case One
      if (user.friends[i].status === "accepted") {
        var a = await AuthModel.findById(
          user.friends[i].userID,
          "username avatar about"
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
          "username avatar about"
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
          "username avatar about"
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
          "username avatar about"
        );
        blockedArray.push({
          sender: user.friends[i].sender,
          details: a,
        });
      }
    }

    function getRandom(arr, num) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    }
    const mayKnowArrays = getRandom(mayKnow, 20);

    for (let i = 0; i < mayKnowArrays.length; i++) {
      var a = await AuthModel.findById(
        mayKnowArrays[i],
        "username avatar about"
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
  });

  socket.on("lockscreen", async (userID) => {
    await AuthModel.findOneAndUpdate({ _id: userID }, { lockScreen: true });
  });

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
};

module.exports = allSockets;
