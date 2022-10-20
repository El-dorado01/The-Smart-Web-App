const express = require('express');
const {
  createForum,
  getforums,
  updateForum,
  getForum,
  deleteForum,
} = require('../controllers/dashboard/public/forums');
const forumRouter = express.Router();

forumRouter.route('/').post(createForum).get(getforums);

forumRouter
  .route('/:forumId')
  .patch(updateForum)
  .get(getForum)
  .delete(deleteForum);

module.exports = forumRouter;
