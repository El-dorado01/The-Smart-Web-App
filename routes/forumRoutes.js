const express = require('express');
const forumRouter = express.Router();

forumRouter.post('/', (req, res) => {
  res.send('create forum');
});

module.exports = forumRouter;
