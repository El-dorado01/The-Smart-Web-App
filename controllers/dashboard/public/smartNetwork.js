const path = require("path");



require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const AuthModel = require("../../../models/AuthModel");
const BookmarkModel = require("../../../models/BookmarkModel");
const SmartNetworkModel = require("../../../models/SmartNetworkModel");
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");

const smartNetwork = async (req, res) => {
  const feeds = await SmartNetworkModel.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $project: {
        notes: "$notes",
        fileUploads: "$fileUploads",
        compressedFileName: "$compressedFileName",
        category: "$category",
        comments: "$comments",
        likes: "$likes",
        createdAt: {
          $dateToString: {
            format: "%Y-%m-%dT%H:%M:%S.%LZ",
            date: "$createdAt",
          },
        },
      },
    },
  ]);

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

  const bookmark = await BookmarkModel.findOne({ user: user.userId });

  if (bookmark) {
    const allBookmarks = bookmark.posts.map((post) => {
      return post.postID;
    });
    res.locals.bookmarks = allBookmarks;
  } else {
    res.locals.bookmarks = false;
  }

  res.locals.smartNetworkFeeds = feeds;

  const page_name = req.path;

  res.status(StatusCodes.OK).render("./dashboard/private/smart_network", {
    headTitle: "Smart Network",
    page_name,
  });

  // res.json({ feeds });
};

const singleFeed = async (req, res) => {
  const feedID = req.params.feedID;
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

  if (feedID == "bookmarks") {
    const bookmark = await BookmarkModel.findOne({ user: user.userId });
    var feeds = [];

    if (bookmark != null) {
      for (let i = 0; i < bookmark.posts.length; i++) {
        const feed = await SmartNetworkModel.findById(bookmark.posts[i].postID);
        feeds.push(feed);
      }
      const allBookmarks = bookmark.posts.map((post) => {
        return post.postID;
      });
      res.locals.smartNetworkFeeds = feeds;
      res.locals.bookmarks = allBookmarks;
      res.status(StatusCodes.OK).render("./dashboard/private/smart_network", {
        headTitle: "Smart Network - Bookmarks",
        page_name,
      });
    } else {
      res.locals.bookmarks = false;
    }
  } else if (feedID == "likes") {
    const bookmark = await BookmarkModel.findOne({ user: user.userId });
    const feeds = await SmartNetworkModel.find({
      "likes.user": user.userId.toString(),
    });

    if (bookmark != null) {
      const allBookmarks = bookmark.posts.map((post) => {
        return post.postID;
      });
      res.locals.bookmarks = allBookmarks;
    } else {
      res.locals.bookmarks = false;
    }
    res.locals.smartNetworkFeeds = feeds;
    res.status(StatusCodes.OK).render("./dashboard/private/smart_network", {
      headTitle: "Smart Network - Likes",
      page_name,
    });
  } else {
    const feed = await SmartNetworkModel.findById(feedID);
    const bookmark = await BookmarkModel.findOne({ user: user.userId });

    if (bookmark != null) {
      const allBookmarks = bookmark.posts.map((post) => {
        return post.postID;
      });
      res.locals.bookmarks = allBookmarks;
    } else {
      res.locals.bookmarks = false;
    }

    res.locals.singleFeed = feed;

    res
      .status(StatusCodes.OK)
      .render("./dashboard/private/smart_network_single", {
        headTitle: "Smart Network",
        page_name,
      });
  }
};

module.exports = {
  smartNetwork,
  singleFeed,
};
