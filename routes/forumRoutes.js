const express = require('express');
const { createForum } = require('../controllers/dashboard/public/forums');
const forumRouter = express.Router();

forumRouter.post('/', createForum);

module.exports = forumRouter;
