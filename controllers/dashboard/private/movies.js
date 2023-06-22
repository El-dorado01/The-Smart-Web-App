const path = require("path");
const fs = require("fs");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const MoviesModel = require("../../../models/MoviesModel");
const AuthModel = require("../../../models/AuthModel");
const PlaylistsModel = require("../../../models/PlaylistsModel");
const ChannelsModel = require("../../../models/ChannelsModel");
const asyncWrapper = require("../../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");

const movies = async (req, res) => {
  const movies = await MoviesModel.find({}).sort("-createdAt");

  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  var friendsArray = [];
  const friendList = await AuthModel.findOne({
    _id: user.userId,
    "friends.status": "pending",
  });
  if (friendList != null) {
    for (let i = 0; i < friendList.friends.length; i++) {
      if (friendList.friends[i].status === "pending") {
        var a = await AuthModel.findById(
          friendList.friends[i].userID,
          "username avatar about"
        );
        friendsArray.push({ sender: friendList.friends[i].sender, details: a });
      }
    }
    function getRandomFriends(arr, num) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    }
    const friends = getRandomFriends(friendsArray, 5);

    res.locals.friends = friends;
  } else {
    res.locals.friends = "empty";
  }

  const channel = await ChannelsModel.findOne({ user: user.userId });

  //Check if channel exists
  if (channel) {
    res.locals.channelRoute = "/dashboard/private/movieChannel/" + channel._id;
  } else {
    res.locals.channelRoute = "/dashboard/private/movies/channel";
  }

  res.locals.smartMovies = movies;

  res.status(StatusCodes.OK).render("./dashboard/private/movies", {
    headTitle: "Smart Movies",
    page_name,
  });
};

const singleMovie = async (req, res) => {
  const page_name = req.path;

  const { movieID } = req.params;

  const movie = await MoviesModel.findOne({ _id: movieID });
  const movies = await MoviesModel.aggregate([{ $sample: { size: 5 } }]);

  var randomMovies = []

  for(var i = 0; i < movies.length; i++){
    var channelForRandomMovies = await ChannelsModel.findOne({ _id: movies[i].channelID });
    var a = randomMovies.push({channel: channelForRandomMovies, randomMovie: movies[i]})
  }

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  var friendsArray = [];
  const friendList = await AuthModel.findOne({
    _id: user.userId,
    "friends.status": "pending",
  });
  if (friendList != null) {
    for (let i = 0; i < friendList.friends.length; i++) {
      if (friendList.friends[i].status === "pending") {
        var a = await AuthModel.findById(
          friendList.friends[i].userID,
          "username avatar about"
        );
        friendsArray.push({ sender: friendList.friends[i].sender, details: a });
      }
    }
    function getRandomFriends(arr, num) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    }
    const friends = getRandomFriends(friendsArray, 5);

    res.locals.friends = friends;
  } else {
    res.locals.friends = "empty";
  }

  //Check if user has viewed the movie before
  const checkView = await MoviesModel.findOne({
    _id: movieID, 'views.userID': user.userId
  })

  if(!checkView){
    await MoviesModel.findOneAndUpdate(
      {_id: movieID},
      { $push: { views: { userID: user.userId } } }
    )
    console.log("Added to Views");
  }

  const channel = await ChannelsModel.findOne({ user: user.userId });
  const channelDetails = await ChannelsModel.findOne({ _id: movie.channelID });
  const subscribers = channelDetails.subscribers;
  const subscribersArray = subscribers.map((subscriber) => {
    return subscriber.userID;
  });

  const userPlaylists = await PlaylistsModel.find({
    userID: user.userId,
  }).sort("-createdAt");

  //Check if channel exists
  if (channel) {
    if (movie.channelID === channel._id.toString()) {
      res.locals.channelAccess = true;
    } else {
      res.locals.channelAccess = false;
    }
    res.locals.channelRoute = "/dashboard/private/movieChannel/" + channel._id;
  } else {
    res.locals.channelAccess = false;
    res.locals.channelRoute = "/dashboard/private/movies/channel";
  }

  res.locals.movie = movie;
  res.locals.randomMovies = randomMovies;
  res.locals.channelDetails = channelDetails
  res.locals.subscribersArray = subscribersArray
  res.locals.userPlaylists = userPlaylists;

  res.status(StatusCodes.OK).render("./dashboard/private/movie_single", {
    headTitle: "Smart Movies",
    page_name,
  });
};

const createChannel = async (req, res) => {
  const page_name = req.path;

  res.locals.channelRoute = "/dashboard/private/movies/channel";

  res.status(StatusCodes.OK).render("./dashboard/private/create_channel", {
    headTitle: "Smart Movies",
    page_name,
  });
};

const channels = async (req, res) => {
  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Check if user has a channel
  const verifyChannel = await ChannelsModel.findOne({ user: user.userId });

  const channelID = req.params.channelID;
  const channel = await ChannelsModel.findOne({ _id: channelID });

  //Check if requested route is correct
  if (channel) {
    if (verifyChannel) {
      if (channelID === verifyChannel._id.toString()) {
        res.locals.channelAccess = true;
        res.locals.channelRoute =
          "/dashboard/private/movieChannel/" + channelID;
      } else {
        res.locals.channelAccess = false;
        res.locals.channelRoute =
          "/dashboard/private/movieChannel/" + verifyChannel._id.toString();
      }
    } else {
      res.locals.channelAccess = false;
      res.locals.channelRoute = "/dashboard/private/movies/channel";
    }

    const page_name = req.path;

    // ==============Check if user is among subscribers================= //

    const findSubscribers = await ChannelsModel.findOne({ _id: channelID });
    const subscribers = findSubscribers.subscribers;
    const subscribersArray = subscribers.map((subscriber) => {
      return subscriber.userID;
    });

    const myMovies = await MoviesModel.find({
      channelID,
    }).sort("-createdAt");

    const channelPlaylists = await PlaylistsModel.find({
      channelID,
    }).sort("-createdAt");

    const userPlaylists = await PlaylistsModel.find({
      userID: user.userId,
    }).sort("-createdAt");

    res.locals.channel = channel;
    res.locals.myMovies = myMovies;
    res.locals.channelPlaylists = channelPlaylists;
    res.locals.userPlaylists = userPlaylists;
    res.locals.subscribersArray = subscribersArray;

    res.status(StatusCodes.OK).render("./dashboard/private/view_channel", {
      headTitle: "Smart Movies - Channel",
      page_name,
    });
  }
};

const postChannels = asyncWrapper(async (req, res) => {
  const { channelName, channelDescription } = req.body;
  const { channelLogo } = req.files;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  let file;
  let filename;
  let uploadOk = 1;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  allowedFiles = channelLogo.mimetype;
  fileSize = channelLogo.size;
  maxSize = 5000000;

  if (allowedFiles && allowedFiles.startsWith("image/")) {
    if (fileSize > maxSize) {
      res.send("File is too big");
      uploadOk = 0;
    } else {
      const fName = channelLogo.name.split(".")[0];

      cloudinary.uploader.upload(
        channelLogo.tempFilePath,
        {
          resource_type: "image",
          public_id: `channelLogos/${fName}`,
        },
        async function (err, logo) {
          if (err) {
            console.log(err);
            uploadOk = 0;
          } else {
            logoPath = logo.secure_url;
            uploadOk = 1;

            const success = await ChannelsModel.create({
              user: user.userId,
              channelName,
              channelDescription,
              logo: logoPath,
            });
            console.log("Channel Created");

            fs.unlinkSync(channelLogo.tempFilePath);
            res.json({ success: success._id });
          }
        }
      );
    }
  }
});

const updateChannelLogo = asyncWrapper(async (req, res) => {
  const { channelLogo } = req.files;

  let newLogoPath;
  let uploadOk = 1;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // logoFile = channelLogo;
  allowedLogoFiles = channelLogo.mimetype;
  logoFileSize = req.files.channelLogo.size;
  maxSize = 5000000;

  if (allowedLogoFiles && allowedLogoFiles.startsWith("image/")) {
    if (logoFileSize > maxSize) {
      res.json({bigFile: true });
      uploadOk = 0;
    } else {
      const fName = uuidv4() + "_" + channelLogo.name.split(".")[0];

      cloudinary.uploader.upload(
        channelLogo.tempFilePath,
        {
          resource_type: "image",
          public_id: `channelLogos/${fName}`,
        },
        async function (err, logo) {
          if (err) {
            console.log(err);
            uploadOk = 0;
          } else {
            newLogoPath = logo.secure_url;
            uploadOk = 1;

            const success = await ChannelsModel.findOneAndUpdate(
              { _id: req.body.channelID },
              { logo: newLogoPath }
            );

            fs.unlinkSync(channelLogo.tempFilePath);
          }
        }
      );
    }
  }
});

const updateChannel = asyncWrapper(async (req, res) => {
  if (req.body.channelName && req.body.channelDescription) {
    const success = await ChannelsModel.findOneAndUpdate(
      { _id: req.body.channelID },
      {
        channelName: req.body.channelName,
        channelDescription: req.body.channelDescription,
      }
    );
    if (success) res.json({ success: "Ok" });
  } else if (req.body.channelName) {
    const success = await ChannelsModel.findOneAndUpdate(
      { _id: req.body.channelID },
      {
        channelName: req.body.channelName,
      }
    );
    if (success) res.json({ success: "Ok" });
  } else if (req.body.channelDescription) {
    const success = await ChannelsModel.findOneAndUpdate(
      { _id: req.body.channelID },
      {
        channelDescription: req.body.channelDescription,
      }
    );
    if (success) res.json({ success: "Ok" });
  }
});

const moviePlaylists = asyncWrapper(async (req, res) => {
  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const subscribedChannels = await ChannelsModel.find({
    "subscribers.userID": user.userId,
  });

  const userPlaylists = await PlaylistsModel.find({
    userID: user.userId,
  }).sort("-createdAt");

  res.locals.myPlaylists = userPlaylists;
  res.locals.userPlaylists = userPlaylists;
  res.locals.subscribedChannels = subscribedChannels;
  res.locals.channelAccess = true

  const channel = await ChannelsModel.findOne({ user: user.userId });
  //Check if channel exists
  if (channel) {
    res.locals.channelRoute = "/dashboard/private/movieChannel/" + channel._id;
  } else {
    res.locals.channelRoute = "/dashboard/private/movies/channel";
  }

  res.status(StatusCodes.OK).render("./dashboard/private/movie_playlists", {
    headTitle: "Smart Movies - Playlists",
    page_name,
  });
});

const singlePlaylist = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  const playlistID = req.params.playlistID;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const userPlaylists = await PlaylistsModel.find({
    userID: user.userId,
  }).sort("-createdAt");

  const playlist = await PlaylistsModel.findById({ _id: playlistID });

  const channel = await ChannelsModel.findOne({ user: user.userId });
  //Check if channel exists
  if (channel) {
    res.locals.channelRoute = "/dashboard/private/movieChannel/" + channel._id;
  } else {
    res.locals.channelRoute = "/dashboard/private/movies/channel";
  }

  res.locals.playlist = playlist;
  res.locals.userPlaylists = userPlaylists;

  res.status(StatusCodes.OK).render("./dashboard/private/single_playlist", {
    headTitle: "Smart Movies - Playlist",
    page_name,
  });
});

const postMovies = asyncWrapper(async (req, res) => {
  const { channel, channelID, movieTitle, releasedYear, movieDescription, movieCategory } = req.body;
  const { thumbnail, fileUpload } = req.files;

    let movieFile;
    let newThumbnailPath;
    let newMoviePath;
    let uploadOk = 1;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    thumbnailFile = thumbnail;
    allowedThumbnailFiles = thumbnail.mimetype;

    movieFile = fileUpload;
    allowedMovieFiles = fileUpload.mimetype;

    thumbnailFileSize = req.files.thumbnail.size;
    maxSize = 2000000;

    if (allowedThumbnailFiles && allowedThumbnailFiles.startsWith("image/")) {
      if (thumbnailFileSize > maxSize) {
        res.json({bigFile: true });
        uploadOk = 0;
      } else {
        if (allowedMovieFiles && allowedMovieFiles === "video/mp4") {
          const thumbnailUUID = uuidv4() + "_";
          const movieUUID = uuidv4() + "_";

          const a = thumbnailUUID + req.files.thumbnail.name;
          const b = movieUUID + req.files.fileUpload.name;

          const thumbnailName =
            thumbnailUUID + req.files.thumbnail.name.split(".")[0];
          const movieName = movieUUID + req.files.fileUpload.name.split(".")[0];

          // ==================Upload Thumbnails ================== //
          cloudinary.uploader.upload(
            thumbnailFile.tempFilePath,
            {
              resource_type: "image",
              public_id: `movieThumbnails/${thumbnailName}`,
            },
            function (err, thumbnails) {
              if (err) {
                console.log(err);
                uploadOk = 0;
              } else {
                newThumbnailPath = thumbnails.secure_url;
                uploadOk = 1;
              }
            }
          );

          // =========================Upload Movies ===================== //
          cloudinary.uploader.upload(
            movieFile.tempFilePath,
            {
              resource_type: "video",
              public_id: `SmartMovies/${movieName}`,
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
            async function (err, video) {
              if (err) {
                console.log(err);
                uploadOk = 0;
              } else {
                newMoviePath = video.secure_url;
                uploadOk = 1;

                // ========================Save Data to database=================== //
                const success = await MoviesModel.create({
                  channel,
                  channelID,
                  title: movieTitle,
                  releasedYear,
                  description: movieDescription,
                  category: movieCategory,
                  thumbnail: newThumbnailPath,
                  thumbnail_id: a,
                  fileUpload: newMoviePath,
                  fileUpload_id: b,
                });

                res.json({ success });

                fs.unlinkSync(movieFile.tempFilePath);
                fs.unlinkSync(thumbnailFile.tempFilePath);
              }
            }
          );
        } else {
          res.json({ movieFileNotAllowed: true });
          uploadOk = 0;
        }
      }
    } else {
      res.json({ thumbnailFileNotAllowed: true });
      uploadOk = 0;
    }
});

const uploadVideo = asyncWrapper(async (req, res) => {
  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const channel = await ChannelsModel.findOne({ user: user.userId });
  //Check if channel exists
  if (channel) {
    res.locals.channelRoute = "/dashboard/private/movieChannel/" + channel._id;
    res.locals.channel = channel

    res.status(StatusCodes.OK).render("./dashboard/private/upload_videos", {
      headTitle: "Smart Movies - Upload Movie",
      page_name,
    });
  } else {
    res.status(StatusCodes.PERMANENT_REDIRECT).redirect("/dashboard/private/movies/channel") = "";
  }

  
});

const editMovie = asyncWrapper(async (req, res) => {
  const movieID = req.params.movieID

  const movie = await MoviesModel.findById({_id: movieID})

  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  
  const channel = await ChannelsModel.findOne({ user: user.userId });
  //Check if channel exists
  if (channel) {
    if (movie.channelID === channel._id.toString()) {
      res.locals.channelRoute = "/dashboard/private/movieChannel/" + channel._id;
      //Render View
      res.locals.movie = movie
      res.status(StatusCodes.OK).render("./dashboard/private/edit_movies", {
        headTitle: "Smart Movies - Edit Movies",
        page_name,
      });
    } else {
      res.status(StatusCodes.PERMANENT_REDIRECT).redirect("/dashboard/private/movieChannel/" + channel._id);
    }
  } else {
    res.status(StatusCodes.PERMANENT_REDIRECT).redirect("/dashboard/private/movies/channel");
  }

})

const updateMovie = asyncWrapper(async (req, res) => {
  if (req.body.movieTitle && req.body.movieDescription) {
    const success = await MoviesModel.findOneAndUpdate(
      { _id: req.body.movieID },
      {
        title: req.body.movieTitle,
        description: req.body.movieDescription,
      }
    );
    if (success) res.json({ success: "Ok" });
    console.log("Success");
  } else if (req.body.movieTitle) {
    const success = await MoviesModel.findOneAndUpdate(
      { _id: req.body.movieID },
      {
        title: req.body.movieTitle,
      }
    );
    if (success) res.json({ success: "Ok" });
  } else if (req.body.movieDescription) {
    const success = await MoviesModel.findOneAndUpdate(
      { _id: req.body.movieID },
      {
        description: req.body.movieDescription,
      }
    );
    if (success) res.json({ success: "Ok" });
  }
});

const updateMovieThumbnail = asyncWrapper(async (req, res) => {
  const { thumbnail } = req.files;
  const movieID = req.body.movieID

  const thumbnailFile =  thumbnail

  let newLogoPath;
  let uploadOk = 1;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // logoFile = channelLogo;
  allowedLogoFiles = thumbnailFile.mimetype;
  logoFileSize = req.files.thumbnail.size;
  maxSize = 5000000;

  if (allowedLogoFiles && allowedLogoFiles.startsWith("image/")) {
    if (logoFileSize > maxSize) {
      res.json({ bigFile: true });
      uploadOk = 0;
    } else {
      const fName = uuidv4() + "_" + thumbnailFile.name.split(".")[0];

      cloudinary.uploader.upload(
        thumbnailFile.tempFilePath,
        {
          resource_type: "image",
          public_id: `movieThumbnails/${fName}`,
        },
        async function (err, thumbnails) {
          if (err) {
            console.log(err);
            uploadOk = 0;
          } else {
            newLogoPath = thumbnails.secure_url;
            uploadOk = 1;

            const success = await MoviesModel.findOneAndUpdate(
              { _id: movieID },
              { thumbnail: newLogoPath }
            );

            fs.unlinkSync(thumbnailFile.tempFilePath);
            res.json({ success: true });
          }
        }
      );
    }
  }
});

module.exports = {
  movies,
  singleMovie,
  createChannel,
  channels,
  postChannels,
  updateChannel,
  updateChannelLogo,
  postMovies,
  moviePlaylists,
  singlePlaylist,
  uploadVideo,
  editMovie,
  updateMovie,
  updateMovieThumbnail
};
