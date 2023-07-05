const express = require("express");

const router = express.Router();

// ===========================Controllers============================//
const { homePage } = require("../controllers/dashboard/private/index");
const {
  liveMeeting,
  room,
  createMeeting,
} = require("../controllers/dashboard/private/liveMeeting");
const {
  settingsForm,
  avatarUpload,
} = require("../controllers/dashboard/private/settings");
const {
  movies,
  singleMovie,
  channels,
  createChannel,
  postChannels,
  updateChannel,
  updateChannelLogo,
  postMovies,
  moviePlaylists,
  singlePlaylist,
  uploadVideo,
  editMovie,
  updateMovie,
  updateMovieThumbnail,
} = require("../controllers/dashboard/private/movies");
const { profile } = require("../controllers/dashboard/private/profile");
const {
  smartNetwork,
  singleFeed,
} = require("../controllers/dashboard/private/smartNetwork");
const { helpCentre } = require("../controllers/dashboard/private/helpCenter");
const {
  colorTheme,
  fontSize,
  background,
} = require("../controllers/dashboard/private/themeCustomization");

// ==============GET ROUTERS========================= //
// router.route("/").get(homePage);
// router.route("/index").get(homePage);
router.route("/movies").get(movies);
router.route("/movies/channel").get(createChannel).post(postChannels);
router.route("/movies/myPlaylists").get(moviePlaylists);
router.route("/movies/uploadVideo").get(uploadVideo);
router.route("/playlist/:playlistID").get(singlePlaylist);
router.route("/movieChannel/:channelID").get(channels);
router.route("/movies/:movieID").get(singleMovie);
router.route("/editMovie/:movieID").get(editMovie);
router.route("/profile/:profileID").get(profile);
router.route("/smart_network").get(smartNetwork);
router.route("/smart_network/:feedID").get(singleFeed);
// router.route("/help_centre").get(helpCentre);
router.route("/live_meeting").get(liveMeeting);
router.route("/live_meeting/:roomID").get(room);
router.route("/settings").get(settingsForm);

// ===============POST ROUTERS===================== //
router.route("/upload/avatar").post(avatarUpload);
router.route("/colorTheme").post(colorTheme);
router.route("/fontSize").post(fontSize);
router.route("/background").post(background);
router.route("/post_movies").post(postMovies);
router.route("/movies/updateChannelLogo").post(updateChannelLogo);
router.route("/updateMovieThumbnail").post(updateMovieThumbnail);
router.route("/movies/updateChannel").post(updateChannel);
router.route("/editMovie").post(updateMovie);
router.route("/create_meeting").post(createMeeting);

module.exports = router;
