const express = require("express");

const router = express.Router();

// ===========================Controllers============================//
const {
  homePage,
  singlePost,
  handlePosts,
  // savePosts,
} = require("../controllers/dashboard/public/index");
const { settingsForm } = require("../controllers/dashboard/public/settings");
const {
  findMates,
  createFindMatesProfile,
} = require("../controllers/dashboard/public/findMates");
const { liveSpaces } = require("../controllers/dashboard/public/liveSpaces");
const { videoSpace } = require("../controllers/dashboard/public/video-space");
const { profile } = require("../controllers/dashboard/public/profile");
const {
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
} = require("../controllers/dashboard/public/forums");
// const { singleForum } = require("../controllers/dashboard/public/forum-single");
const {
  smartNetwork,
} = require("../controllers/dashboard/public/smartNetwork");
const { helpCentre } = require("../controllers/dashboard/public/helpCenter");

// ===================GET ROUTERS========================= //
router.route("/").get(homePage);
router.route("/index").get(homePage);
router.route("/index/:postID").get(singlePost);
// router.route("/:postID").get(singlePost);
router.route("/forums").get(forums);
router.route("/forum/:forumID").get(singleForum);
router.route("/forum/:forumID/key?:topicID").get(forumTopicInfo);
router.route("/member_profile/:forumID/key?:memberID").get(visitMemberProfile);
router.route("/find_mates").get(findMates);
router.route("/live_spaces").get(liveSpaces);
// // router.route("/live_space?name=&id=").get(videoSpace)
router.route("/profile").get(profile);
router.route("/smart_network").get(smartNetwork);
router.route("/help_centre").get(helpCentre);
router.route("/settings").get(settingsForm);

// ===============POST ROUTERS===================== //
router.route("/addPost").post(handlePosts);
router.route("/createForum").post(createForum);
router.route("/modifyModerators").post(modifyModerators);
router.route("/updateForumRanks").post(updateForumRanks);
router.route("/deleteForum").post(deleteForum);
router.route("/updateForumDisplayPic").post(updateForumDisplayPic);
router.route("/updateForumProfile").post(updateForumProfile);
router.route("/performActionAsModerator").post(performActionAsModerator);
router.route("/updateForumInvites").post(updateForumInvites);
router.route("/createATopic").post(createATopic);
router.route("/deleteATopic").post(deleteATopic);
router.route("/replyToATopic").post(replyToATopic);
router.route("/deleteAResponse").post(deleteAResponse);
router.route("/createFindMatesProfile").post(createFindMatesProfile);
// router.route("/savePost").post(savePosts);

module.exports = router;
