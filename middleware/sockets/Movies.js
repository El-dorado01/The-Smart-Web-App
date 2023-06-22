require("express-async-errors");
const asyncWrapper = require("../async");
const { v4: uuidv4 } = require("uuid");

const AuthModel = require("../../models/AuthModel");
const ChannelsModel = require("../../models/ChannelsModel");
const MoviesModel = require("../../models/MoviesModel");
const PlaylistsModel = require("../../models/PlaylistsModel");

// const openMoviesTab = ;

// const createChannelPlaylist = ;

// const createUserPlaylist = ;

// const addMovieToChannelPlaylist = ;

const addMovieToUsersPlaylist = async (response) => {
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
};

// const createChannelPlaylistAndAddMovie = ;

// const createUserPlaylistAndAddMovie = ;

const deleteMovie = async (response) => {
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
};

const postCommentsOnMovie = async (comment) => {
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
};

const subscribeToAMovieChannel = async (response) => {
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
};

const unsubscribeFromAMovieChannel = async (response) => {
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
};

const deletePlaylist = async (response) => {
  await PlaylistsModel.findOneAndDelete({ _id: response });

  console.log("Playlist Deleted");
};

// const showMoviesInAPlaylist = ;

const removeAMovieFromAPlaylist = async (response) => {
  var a = await PlaylistsModel.findOneAndUpdate(
    {
      _id: response.playlistID,
    },
    { $pull: { movies: { movieID: response.movieID } } }
  );

  if (a) {
    console.log("Video removed from Playlist");
  }
};

const likeAMovie = async (response) => {
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
  if (like) console.log("Movie has been added to Liked Videos");
};

const unlikeAMovie = async (response) => {
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
  if (dislike) console.log("Movie has been Disliked");
};

const removeAMovieFromLikedVideos = async (response) => {
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
};

const removeAMovieFromDislikedVideos = async (response) => {
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
};

// const showCommentsOnAMovie = ;

const likeACommentOnAMovie = async (replies) => {
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

  if (like) console.log("Movie Comment Liked");
};

const unlikeACommentOnAMovie = async (replies) => {
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
};

const postAReplyOnACommentOnAMovie = async (moreComments) => {
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
};

module.exports = {
  // openMoviesTab,
  // createChannelPlaylist,
  // createUserPlaylist,
  // addMovieToChannelPlaylist,
  addMovieToUsersPlaylist,
  // createChannelPlaylistAndAddMovie,
  // createUserPlaylistAndAddMovie,
  deleteMovie,
  postCommentsOnMovie,
  subscribeToAMovieChannel,
  unsubscribeFromAMovieChannel,
  deletePlaylist,
  // showMoviesInAPlaylist,
  removeAMovieFromAPlaylist,
  likeAMovie,
  unlikeAMovie,
  removeAMovieFromLikedVideos,
  removeAMovieFromDislikedVideos,
  // showCommentsOnAMovie,
  likeACommentOnAMovie,
  unlikeACommentOnAMovie,
  postAReplyOnACommentOnAMovie,
};
