const express = require("express");

const router = express.Router();

// ===========================Controllers============================//
const {
  homePage,
  singlePost,
} = require("../controllers/dashboard/public/index");
const { settingsForm } = require("../controllers/dashboard/public/settings");
const { findMates } = require("../controllers/dashboard/public/findMates");
const { liveSpaces } = require("../controllers/dashboard/public/liveSpaces");
const { videoSpace } = require("../controllers/dashboard/public/video-space");
const { profile } = require("../controllers/dashboard/public/profile");
const { forums } = require("../controllers/dashboard/public/forums");
const { singleForum } = require("../controllers/dashboard/public/forum-single");
const {
  smartNetwork,
} = require("../controllers/dashboard/public/smartNetwork");
const { helpCentre } = require("../controllers/dashboard/public/helpCenter");

router.route("/").get(homePage);
router.route("/index").get(homePage);
router.route("/index/:postID").get(singlePost);
router.route("/:postID").get(singlePost);
router.route("/forums").get(forums);
// // router.route("/forums?name=&id=").get(singleForum)
router.route("/find_mates").get(findMates);
router.route("/live_spaces").get(liveSpaces);
// // router.route("/live_space?name=&id=").get(videoSpace)
router.route("/profile").get(profile);
router.route("/smart_network").get(smartNetwork);
router.route("/help_centre").get(helpCentre);
router.route("/settings").get(settingsForm);

module.exports = router;
