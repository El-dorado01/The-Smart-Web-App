/*
  =======================================================================================
  ************************************SMART NETWORK**************************************
  //Like Smart Network Posts
  //Unlike Smart Network Posts
  //Bookmark Smart Network Posts
  //Unbookmark Smart Network Posts
  //Post Comments on Smart Network Posts - Recieves comments from the client side and update them in the database
  //Show Replies on a Comment on Smart Network Posts - Fetch replies on a comment from database
  //Post Replies on a Comment on Smart Network Posts - Receives comments from the client side and update them in the database
  =======================================================================================
  */
socket.on("likePost", likeSmartNetworkPost);
socket.on("unlikePost", unlikeSmartNetworkPost);
socket.on("bookmarkPost", bookmarkSmartNetworkPost);
socket.on("unBookmarkPost", unbookmarkSmartNetworkPost);
socket.on("postComments", postCommentsOnSmartNetworkPosts);
// socket.on("singlePostComments");
socket.on("showReplies", showRepliesOnACommentOnSmartNetworkPosts);
socket.on("postMoreComments", postRepliesOnACommentOnSmartNetworkPosts);

/*
  =======================================================================================
  ************************************MOVIES TAB*****************************************
  -----------------------------Movies----------------------------
  //Open Movies Tab
  //Delete Movie
  //Like a Movie
  //Unlike a Movie
  //Remove a Movie From Liked Video
  //Remove a Movie From Disliked Video
  -----------------------------Comments & Replies----------------------------
  //Show Comments On a Movie
  //Like a Comment on a Movie
  //Unlike a Comment on a Movie
  //Post Comments on Movies - Receives a movie's comments from the client side and update them in the database
  //Post a Reply Under a Comment On a Movie - Receives a reply on a movie's comments from the client side and update them in the database
  -----------------------------Playlists----------------------------
  //Create Channel Playlist
  //Create Channel Playlist and Add a Movie
  //Create User Playlist
  //Create User Playlist and Add a Movie
  //Add Movies to Channel Playlist
  //Add Movies to User Playlist
  //Show Movies in a Playlist
  //Delete or Remove a Movie From a Playlist
  //Delete Playlist
  -----------------------------Channels----------------------------
  //Subscribe to a Movie Channel
  //Unsubscribe from a Movie Channel
  =======================================================================================
  */
socket.on("openMoviesTab", openMoviesTab);
socket.on("postPlaylist", createChannelPlaylist);
socket.on("postUserPlaylist", createUserPlaylist);
socket.on("addVideoToPlaylist", addMovieToChannelPlaylist);
socket.on("addVideoToUserPlaylist", addMovieToUsersPlaylist);
socket.on("createPlaylistAndAddVideo", createChannelPlaylistAndAddMovie);
socket.on("createUserPlaylistAndAddVideo", createUserPlaylistAndAddMovie);
socket.on("deleteMovie", deleteMovie);
socket.on("postMovieComments", postCommentsOnMovie);
socket.on("subscribe", subscribeToAMovieChannel);
socket.on("unSubscribe", unsubscribeFromAMovieChannel);
socket.on("deletePlaylist", deletePlaylist);
socket.on("showPlaylistVideos", showMoviesInAPlaylist);
socket.on("removeFromPlaylist", removeAMovieFromAPlaylist);
socket.on("likeVideo", likeAMovie);
socket.on("dislikeVideo", unlikeAMovie);
socket.on("removeLikeVideo", removeAMovieFromLikedVideos);
socket.on("removeDislikeVideo", removeAMovieFromDislikedVideos);
socket.on("showVideoReplies", showCommentsOnAMovie);
socket.on("likeComment", likeACommentOnAMovie);
socket.on("unlikeComment", unlikeACommentOnAMovie);
socket.on("postMoreVideoComments", postAReplyOnACommentOnAMovie);

/*
  =======================================================================================
  ************************************LIVE MEETING***************************************
  //Show Information about a Meeting
  //Cancel or Delete a Meeting
  //Start Meeting - Interact with database and start meeting.
  //Join Meeting
  //End Meeting - Interact with database and end meeting.
  =======================================================================================
  */
socket.on("showMeetingDetails", showInfoAboutAMeeting);
socket.on("cancelMeeting", cancelAMeeting);
socket.on("startMyRoom", startAMeeting);
socket.on("endMeeting", endAMeeting);
socket.on("joinRoom", joinAMeeting);

/*
  =======================================================================================
  ************************************FRIENDS TAB****************************************
  //Add a Friend or Send a Friend Request
  //Cancel a Sent Request
  //Accept a Friend Request
  //Decline a Friend Request
  //Delete Declined Requests
  //Block a User
  //Unblock a User
  //Load Contacts and Friend Lists
  =======================================================================================
  */
socket.on("addFriend", sendAFriendRequest);
socket.on("cancelRequest", cancelASentRequest);
socket.on("acceptRequest", acceptAFriendRequest);
socket.on("declineRequest", declineAFriendRequest);
socket.on("deleteDeclinedRequest", deleteDeclinedRequests);
socket.on("blockUserEmit", blockAUser);
socket.on("unBlockUserEmit", unblockAUser);
socket.on("loadContacts", loadContactsAndFriends);

/*
  =======================================================================================
  ************************************LOCKSCREEN*****************************************
  //Lock screen
  //Unlock screen - User unlocks screen using password
  =======================================================================================
  */
socket.on("lockscreen");
socket.on("unlockScreen");
