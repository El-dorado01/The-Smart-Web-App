if (document.getElementById("defaultOpen")) {
  document.getElementById("defaultOpen").click();
}

if (document.getElementById("defaultOpen2")) {
  document.getElementById("defaultOpen2").click();
}

setTimeout(() => {
  if (document.getElementById("defaultOpen3")) {
    document.getElementById("defaultOpen3").click();
  }
}, 5000);

const socket = io();

if (theUserID) loadContactsInit(theUserID);

function loadContactsInit(userID) {
  socket.emit("loadContacts", userID);
}

function lockScreen(userID) {
  socket.emit("lockscreen", userID);
  window.location.href = "/dashboard/lockscreen";
}

socket.on("passwordStatus", (status) => {
  if (status == "invalid") {
    dangerAlert.style.display = "block";
    dangerMessage.textContent = "Invalid Password";

    setTimeout(() => {
      dangerAlert.style.display = "none";
    }, 5000);
  } else {
    window.location.href = "/dashboard/index";
  }
});

socket.on(
  "contactsReady",
  (contactsArray, requestsArray, declinedArray, blockedArray, mayKnow) => {
    if (document.getElementById("contactsArrayCount")) {
      loadContacts(
        contactsArray,
        requestsArray,
        declinedArray,
        blockedArray,
        mayKnow
      );
    }
  }
);

function loadContacts(
  contactsArray,
  requestsArray,
  declinedArray,
  blockedArray,
  mayKnow
) {
  if (contactsArray == "empty") {
    document.getElementById("contactsArrayCount").innerText = 0;
  } else {
    document.getElementById("contactsArrayCount").innerText =
      contactsArray.length;
  }
  if (requestsArray == "empty") {
    document.getElementById("requestsArrayCount").innerText = 0;
  } else {
    var count = 0;
    for (let i = 0; i < requestsArray.length; i++) {
      requestsArray[i];
      if (requestsArray[i].sender !== theUserID) {
        count++;
      }
    }
    document.getElementById("requestsArrayCount").innerText = count;
  }
  if (requestsArray == "empty") {
    document.getElementById("outgoingArrayCount").innerText = 0;
  } else {
    var count = 0;
    for (let i = 0; i < requestsArray.length; i++) {
      requestsArray[i];
      if (requestsArray[i].sender === theUserID) {
        count++;
      }
    }
    document.getElementById("outgoingArrayCount").innerText = count;
  }
  if (declinedArray == "empty") {
    document.getElementById("declinedArrayCount").innerText = 0;
  } else {
    var count = 0;
    for (let i = 0; i < declinedArray.length; i++) {
      declinedArray[i];
      if (declinedArray[i].sender !== theUserID) {
        count++;
      }
    }
    document.getElementById("declinedArrayCount").innerText = count;
  }
  if (blockedArray == "empty") {
    document.getElementById("blockedArrayCount").innerText = 0;
  } else {
    document.getElementById("blockedArrayCount").innerText =
      blockedArray.length;
  }

  var newContactsArray = [];
  var newOutgoingArray = [];
  if (requestsArray != "empty") {
    requestsArray.forEach((contact) => {
      if (contact.sender === theUserID.toString()) {
        newOutgoingArray.push(contact.details._id.toString());
      }
    });
  }
  if (contactsArray != "empty") {
    contactsArray.forEach((contact) => {
      newContactsArray.push(contact.details._id.toString());
    });
  }

  var div = document.createElement("div");
  div.innerHTML = `
  <div class="postFeeds3" id="friendList">
    ${
      contactsArray != "empty"
        ? contactsArray
            .map((contact) => {
              return `<div class="contact">
            <div class="contact-info">
                <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                    <div class="profile-pic">
                        <img src="../../../uploads/${contact.details.avatar}" alt="">
                    </div>
                </a>
                <div class="info">
                    <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                        <h3>${contact.details.username}</h3>
                        <p class="text-muted">${contact.details.about}</p>
                    </a>
                </div>
            </div>
            <div class="action-buttons">
                <div><i class="fa fa-video"></i></div>
                <div><i class="fa fa-phone"></i></div>
                <div><i class="fa fa-envelope"></i></div>
                <div><i class="fa fa-ellipsis-v"></i></div>
            </div>
          </div>
          `;
            })
            .join("")
        : `
          <div class="postFeed-body">
            <span class="text-muted">You have no records</span>
          </div>
        `
    }
  </div>
  <div class="postFeeds3" id="mayKnow">
    ${
      mayKnow != "empty"
        ? mayKnow
            .map((contact) => {
              if (
                contact._id.toString() !== theUserID.toString() &&
                !newContactsArray.includes(contact._id.toString()) &&
                !newOutgoingArray.includes(contact._id.toString())
              ) {
                return `<div class="contact">
                <div class="contact-info">
                    <a href="/dashboard/private/profile/${contact._id}" target="_blank">
                        <div class="profile-pic">
                            <img src="../../../uploads/${contact.avatar}" alt="">
                        </div>
                    </a>
                    <div class="info">
                        <a href="/dashboard/private/profile/${contact._id}" target="_blank">
                            <h3>${contact.username}</h3>
                            <p class="text-muted">${contact.about}</p>
                        </a>
                    </div>
                </div>
                <div class="action-buttons">
                    <div><i title="Add as Friend" onclick="addFriend('${theUserID}', '${contact._id}', this)" class="fa fa-user-plus"></i></div>
                </div>
              </div>
            `;
              }
            })
            .join("")
        : `
        <div class="postFeed-body">
          <span class="text-muted">You have no records</span>
        </div>
        `
    }
  </div>
  <div class="postFeeds3" id="requests">
      ${
        requestsArray != "empty"
          ? requestsArray
              .map((contact) => {
                if (contact.sender !== theUserID.toString()) {
                  return `<div class="contact">
                  <div class="contact-info">
                      <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                          <div class="profile-pic">
                              <img src="../../../uploads/${contact.details.avatar}" alt="">
                          </div>
                      </a>
                      <div class="info">
                          <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                              <h3>
                                  ${contact.details.username}
                              </h3>
                              <p class="text-muted">
                                  ${contact.details.about}
                              </p>
                          </a>
                      </div>
                  </div>
                  <div class="action-buttons">
                      <div>
                          <i class="fas fa-user-check" title="Accept Request" id="btnX_${contact.details._id}"
                              onclick="btnX('${theUserID}','${contact.details._id}', 'accept', this)"></i>
                      </div>
                      <div>
                          <i class="fa fa-user-times" title="Decline Request" id="btnX2_${contact.details._id}"
                              onclick="btnX('${theUserID}','${contact.details._id}', 'decline', this)"></i>
                      </div>
                  </div>
              </div>`;
                }
              })
              .join("")
          : `
          <div class="postFeed-body">
              <span class="text-muted">You have no records</span>
          </div>`
      }
  </div>
  <div class="postFeeds3" id="outgoing">
    ${
      requestsArray != "empty"
        ? requestsArray
            .map((contact) => {
              if (contact.sender === theUserID.toString()) {
                return `<div class="contact">
                <div class="contact-info">
                    <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                        <div class="profile-pic">
                            <img src="../../../uploads/${contact.details.avatar}" alt="">
                        </div>
                    </a>
                    <div class="info">
                        <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                            <h3>
                                ${contact.details.username}
                            </h3>
                            <p class="text-muted">
                                ${contact.details.about}
                            </p>
                        </a>
                    </div>
                </div>
                <div class="action-buttons">
                    <div><i class="fa fa-user-times" style="color: var(--color-primary);" title="Cancel Request"
                            onclick="addFriend2('${theUserID}', '${contact.details._id}', this)"></i></div>
                </div>
            </div>`;
              }
            })
            .join("")
        : `
          <div class="postFeed-body">
              <span class="text-muted">You have no records</span>
          </div>`
    }
  </div>
  <div class="postFeeds3" id="declinedRequests">
    ${
      declinedArray != "empty"
        ? // <div style="width: 100%; display: flex; align-items: center; justify-content: flex-end;">
          //             <button class="btn btn-danger" onclick="clearDeclined()"> <i class="fa fa-trash"></i> Clear All</button>
          //         </div>
          declinedArray
            .map((contact) => {
              if (contact.sender !== theUserID.toString()) {
                return `<div class="contact" id="contact_${contact.details._id}">
              <div class="contact-info">
                  <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                      <div class="profile-pic">
                          <img src="../../../uploads/${contact.details.avatar}" alt="">
                      </div>
                  </a>
                  <div class="info">
                      <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                          <h3>
                              ${contact.details.username}
                          </h3>
                          <p class="text-muted">
                              ${contact.details.about}
                          </p>
                      </a>
                  </div>
              </div>
              <div class="action-buttons">
                  <div>
                      <i class="fas fa-user-check" title="Accept Request" id="btnX3_${contact.details._id}"
                          onclick="btnX2('${theUserID}','${contact.details._id}', 'accept', this)"></i>
                  </div>
                  <div>
                      <i class="fa fa-user-times" style="color: var(--color-primary);" title="Decline Request"
                          id="btnX4_${contact.details._id}"
                          onclick="btnX2('${theUserID}','${contact.details._id}', 'decline', this)"></i>
                  </div>
                  <div><i class="fa fa-trash"
                          onclick="deleteDeclinedRequest('${theUserID}','${contact.details._id}')"></i></div>
              </div>
            </div>`;
              }
            })
            .join("")
        : `
        <div class="postFeed-body">
            <span class="text-muted">You have no records</span>
        </div>`
    }
  </div>
  <div class="postFeeds3" id="blocked">
  ${
    blockedArray != "empty"
      ? blockedArray
          .map((contact) => {
            return `<div class="contact">
          <div class="contact-info">
              <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                  <div class="profile-pic">
                      <img src="../../../uploads/${contact.details.avatar}" alt="">
                  </div>
              </a>
              <div class="info">
                  <a href="/dashboard/private/profile/${contact.details._id}" target="_blank">
                      <h3>
                          ${contact.details.username}
                      </h3>
                      <p class="text-muted">
                          ${contact.details.about}
                      </p>
                  </a>
              </div>
          </div>
          <div class="action-buttons">
              <div><i title="Unblock User" onclick="blockUsers('${theUserID}', '${contact.details._id}', this)"
                      style="color: var(--color-primary);" class="fa-solid fa-user-slash"></i></div>
          </div>
        </div>`;
          })
          .join("")
      : `<div class="postFeed-body">
          <span class="text-muted">You have no records</span>
      </div>`
  }
  </div>
`;
  document.getElementById("contact-list-feed").appendChild(div);
}

let blockUserEmit = (userID, friendID, type) => {
  if (type == "unblock") {
    socket.emit("unBlockUserEmit", { userID, friendID });
  } else {
    socket.emit("blockUserEmit", { userID, friendID });
  }
};

let addFriend = (userID, friendID, obj) => {
  if (obj.classList.contains("fa-user-plus")) {
    obj.classList.replace("fa-user-plus", "fa-user-times");
    obj.title = "Cancel Request";
    obj.style.color = "var(--color-primary)";

    successAlert.style.display = "block";
    successAlertIcon.className = "";
    successAlertIcon.className = "fas fa-user-check";
    successMessage.textContent = "Friend Request Sent";

    setTimeout(() => {
      successAlert.style.display = "none";
    }, 3000);
    socket.emit("addFriend", { userID, friendID });
  } else {
    obj.classList.replace("fa-user-times", "fa-user-plus");
    obj.title = "Add as Friend";
    obj.style.color = "";

    successAlert.style.display = "block";
    successAlertIcon.className = "";
    successAlertIcon.className = "fa fa-user-times";
    successMessage.textContent = "Request Cancelled";

    setTimeout(() => {
      successAlert.style.display = "none";
    }, 3000);
    socket.emit("cancelRequest", { userID, friendID });
  }
};

let addFriend2 = (userID, friendID, obj) => {
  if (obj.classList.contains("fa-user-times")) {
    obj.classList.replace("fa-user-times", "fa-user-plus");
    obj.title = "Add as Friend";
    obj.style.color = "";

    successAlert.style.display = "block";
    successAlertIcon.className = "";
    successAlertIcon.className = "fa fa-user-times";
    successMessage.textContent = "Request Cancelled";

    setTimeout(() => {
      successAlert.style.display = "none";
    }, 3000);
    socket.emit("cancelRequest", { userID, friendID });
  } else {
    obj.classList.replace("fa-user-plus", "fa-user-times");
    obj.title = "Cancel Request";
    obj.style.color = "var(--color-primary)";

    successAlert.style.display = "block";
    successAlertIcon.className = "";
    successAlertIcon.className = "fas fa-user-check";
    successMessage.textContent = "Friend Request Sent";

    setTimeout(() => {
      successAlert.style.display = "none";
    }, 3000);
    socket.emit("addFriend", { userID, friendID });
  }
};

var updateFriendRequest = (userID, id, type) => {
  if (type === "accept") {
    socket.emit("acceptRequest", { userID, id });
    if (document.getElementById(id)) document.getElementById(id).remove();

    if (document.querySelectorAll(".friend-requests .request").length <= 0) {
      document.querySelector(".friend-requests").style.display = "none";
    }
  } else {
    socket.emit("declineRequest", { userID, id });
    if (document.getElementById(id)) document.getElementById(id).remove();

    if (document.querySelectorAll(".friend-requests .request").length <= 0) {
      document.querySelector(".friend-requests").style.display = "none";
    }
  }
};

if (document.querySelector(".friend-requests")) {
  if (document.querySelectorAll(".friend-requests .request").length <= 0) {
    document.querySelector(".friend-requests").style.display = "none";
  }
}

let endRoom = async (roomID) => {
  if (confirm("Are you sure you want to end this meeting?")) {
    socket.emit("endMeeting", roomID);
    window.location.href = "/dashboard/private/live_meeting";
  }
};

socket.on("youCanJoin", (response) => {
  if (response.status === "success") {
    if (response.host == true) {
      //Send back a message to user
      dangerAlert.style.display = "block";
      dangerMessage.textContent =
        "You created this room. You can start the meeting instead";

      setTimeout(() => {
        dangerAlert.style.display = "none";
      }, 5000);
    } else {
      window.location.href = `/dashboard/private/live_meeting/${response.roomID}`;
    }
  } else {
    //Give and error feedback
    dangerAlert.style.display = "block";
    dangerMessage.textContent = "The Room ID you Entered is Incorrect";

    setTimeout(() => {
      dangerAlert.style.display = "none";
    }, 5000);
  }
});

socket.on("youCanStart", (roomID) => {
  window.location.href = `/dashboard/private/live_meeting/${roomID}`;
});

function showMeetingDetails(roomID) {
  socket.emit("showMeetingDetails", roomID);
}

function closeViewMeeting() {
  const viewMeeting = document.querySelector(".view-meeting");
  viewMeeting.innerHTML = "";
  viewMeeting.style.display = "none";
}

function cancelMeeting(roomID) {
  if (confirm("Are you sure you want to cancel this meeting?")) {
    socket.emit("cancelMeeting", roomID);
    var meetingBodies = document.querySelectorAll(".meeting-body .meeting");
    meetingBodies.forEach((body) => {
      if (body.id == roomID) {
        body.remove();
      }
    });
    if (!document.querySelectorAll(".meeting-body .meeting")) {
      document.querySelectorAll(".messages .body").forEach((item) => {
        item.style.display = "flex";
      });
    }
    const viewMeeting = document.querySelector(".view-meeting");
    viewMeeting.innerHTML = "";
    viewMeeting.style.display = "none";
  }
}

socket.on("getMeetingDetails", (meetingDetails) => {
  const viewMeeting = document.querySelector(".view-meeting");
  viewMeeting.style.display = "flex";

  viewMeeting.innerHTML = `
    <div class="button-container">
        <button class="btn btn-primary" style="width: 30%;" onclick="closeViewMeeting()">
          <i class="fa fa-times"></i> Close
        </button>
    </div>
    <h3>${meetingDetails.roomName}</h3>
    <div class="meeting-details">
        <div class="child">
            <h4>Room Capacity</h4>
            <p class="text-muted">${meetingDetails.roomCapacity}</p>
        </div>
        <div class="child">
            <h4>Meeting Time</h4>
            <p>
                This meeting starts by
                <span class="text-muted">${meetingDetails.roomTime}</span>
            </p>    
        </div>
        <div class="child">
            <h4>Meeting Date</h4>
            <p>
                This meeting is scheduled to hold on
                <span class="text-muted">${meetingDetails.roomDate}</span>
            </p>
        </div>
        <div class="child">
            <h4>Room ID</h4>
            <p>
                <span class="text-muted">${meetingDetails._id}</span>
            </p>    
            <button class="btn btn-primary" style="width: 100%; border-radius: 10px; margin-top: 10px;" onclick="copyPlaylistLink('${getURL}/dashboard/private/live_meeting/${meetingDetails._id}')"> <i class="fa fa-clipboard"></i> Copy Link Instead</button>
        </div>
    </div>
    <div style="width: 100%; gap: 2%;">
        <button class="btn btn-danger" onclick="cancelMeeting('${meetingDetails._id}')" style="width: 49%; border-radius: 10px; margin-top: 10px;"> 
            <i class="fa fa-times"></i>
            Cancel Meeting
        </button>
        <button class="btn btn-primary" onclick="startRoom('${meetingDetails._id}','${meetingDetails.Host}')" style="width: 49%; border-radius: 10px; margin-top: 10px;"> <i class="fa fa-users"></i>
            Start Meeting</button>
    </div>
  `;
});

socket.on("newChatMessage", (response) => {
  displayMessage(response);
});

socket.on("chatRoomMessages", (response) => {
  displayChatRoom(response);
});

socket.on("getCreatePlaylistAndAddVideo", (playlist) => {
  displayNewPlaylistTwo(playlist);
});

function displayNewPlaylistTwo(playlist) {
  var playlistMovies1 = playlist.movies[playlist.movies.length - 1];

  var div = document.createElement("div");
  div.classList.add(`vid-list3${playlist._id}`);

  div.innerHTML = `
          <div class="vid-list3" onclick="showPlaylistVideos('${playlist._id}')">
            <div class="thumbnails">
              <img src="${playlistMovies1.thumbnail}" alt="" class="thumbnail-1">
            </div>
            <div class="shadow">
                <span style="color: var(--color-primary);" class="fa fa-play-circle-o"></span>
                <h4 style="color: var(--color-primary);">${playlist.playlistName} <br> <span class="text-muted" style="color: var(--color-primary);">1 Video</span></h4>
            </div>
          </div>
          <button class="btn" onclick="deletePlaylist('${playlist._id}')"
              style="color: var(--color-danger); margin: 5px 0; width: 100%;"> 
              <i class="fa fa-trash"></i> Delete Playlist
          </button>
  `;
  document.querySelector("#channelPlaylist .list-container").appendChild(div);

  var div2 = document.createElement("div");
  div2.classList.add("option");
  div2.classList.add("option" + playlist._id);
  div2.setAttribute("onclick", "updateVideoOption(this)");

  div2.innerHTML = `
      <input type="radio" value="${playlist._id}" name="playlist" class="radio">
          <label for="${playlist.playlistName}">${playlist.playlistName}</label>
  `;

  document.querySelector(".options-container2").appendChild(div2);
}

socket.on("getCreateUserPlaylistAndAddVideo", (playlist) => {
  displayNewPlaylistThree(playlist);
});

function displayNewPlaylistThree(playlist) {
  var div2 = document.createElement("div");
  div2.classList.add("option");
  div2.classList.add("option" + playlist._id);
  div2.setAttribute("onclick", "updateVideoOption2(this)");

  div2.innerHTML = `
      <input type="radio" value="${playlist._id}" name="playlist2" class="radio">
          <label for="${playlist.playlistName}">${playlist.playlistName}</label>
  `;

  document.querySelector(".options-container-video-forum").appendChild(div2);
}

socket.on("getMovieAddedToPlaylist", (playlist) => {
  displayNewPlaylists(playlist);
});

function displayNewPlaylists(playlists) {
  document.querySelector("#channelPlaylist .list-container").remove();

  var div = document.createElement("div");
  div.classList.add("list-container");
  div.style.marginBottom = "100px";

  div.innerHTML = `
    ${playlists
      .map((playlist) => {
        if (playlist.movies.length > 1)
          var playlistMovies1 = playlist.movies[playlist.movies.length - 1];
        var playlistMovies2 = playlist.movies[playlist.movies.length - 2];
        if (playlist.movies.length > 0)
          var playlistMovies1 = playlist.movies[playlist.movies.length - 1];
        return `
                <div class="vid-list3${playlist._id}">
                  <div class="vid-list3" onclick="showPlaylistVideos('${
                    playlist._id
                  }')">
                    <div class="thumbnails">
                      ${
                        playlist.movies.length > 1
                          ? `
                            <img src="${playlistMovies1.thumbnail}" alt="" class="thumbnail-1">
                            <img src="${playlistMovies2.thumbnail}" alt="" class="thumbnail-2">`
                          : playlist.movies.length > 0
                          ? `
                            <img src="${playlistMovies1.thumbnail}" alt="" class="thumbnail-1">`
                          : ""
                      }
                    </div>
                    <div class="shadow">
                        <span style="color: var(--color-primary); class="fa fa-play-circle-o"></span>
                        <h4 style="color: var(--color-primary);>${
                          playlist.playlistName
                        } <br> 
                        <span style="color: var(--color-primary); class="text-muted">${
                          playlist.movies.length
                        } Video${
          playlist.movies.length > 1 ? "s" : ""
        }</span></h4>
                    </div>
                  </div>
                  <button class="btn" onclick="deletePlaylist('${
                    playlist._id
                  }')"
                      style="color: var(--color-danger); margin: 5px 0; width: 100%;"> 
                      <i class="fa fa-trash"></i> Delete Playlist
                  </button>
                </div>
              `;
      })
      .join("")}
  `;

  document.querySelector("#channelPlaylist").appendChild(div);
}

socket.on("newMoviesTab", (newMoviesTab) => {
  displayMoviesTab(newMoviesTab);
});

function displayMoviesTab(movies) {
  document.querySelector(".list-container").remove();

  var div = document.createElement("div");
  div.classList.add("list-container");

  div.innerHTML = ` 
  ${movies
    .map((movie) => {
      return `
              <div class="vid-list">
                  <a href="/dashboard/private/movies/${movie._id}">
                      <div class="thumbnail">
                          <img src="${movie.thumbnail}" alt="" />
                      </div>
                  </a>
                  <div class="flex-div">
                      <img src="../../../images/smart.png" alt="" />
                      <div class="vid-info">
                          <a href="/dashboard/private/movies/${movie._id}">
                              ${movie.title}
                          </a>
                          <p>${movie.channel}</p>
                          <p>20k views &bull; 5 days</p>
                      </div>
                  </div>
              </div>
      `;
    })
    .join("")}
  `;

  document.querySelector(".movies-container").appendChild(div);
}

socket.on("replyRoom", (replies) => {
  displayReplyRoom(replies);
});

function displayReplyRoom(replies) {
  const postID = replies.postID;
  const newReplies = replies.result[0];

  var commentTimeInMS = new Date() - new Date(newReplies.datePosted);
  var commentSecs = commentTimeInMS / 1000;
  var commentMins = commentTimeInMS / (1000 * 60);
  var commentHours = commentTimeInMS / (1000 * 60 * 60);
  var commentDays = commentTimeInMS / (1000 * 60 * 60 * 24);
  var commentWeeks = commentTimeInMS / (1000 * 60 * 60 * 24 * 7);

  var div = document.createElement("div");

  div.innerHTML = `
                    <div class="back" onclick="closeReplies()"><span class="fa fa-arrow-left"></span></div>
                    <h2>Replies for ${newReplies.username}</h2>
                    <div class="caption">
                      <div class="comment-section comment2${newReplies._id} ">
                          <div class="single-comment">
                              <span class="user-avatar">
                                  <img src="../../../uploads/${
                                    newReplies.avatar
                                  }" alt="">
                              </span>
                              <span class="user">
                                  <p>
                                      <b style="margin-right: 5px;">
                                          ${newReplies.username}
                                      </b>
                                  </p>
                                  <span>
                                      ${newReplies.message}
                                  </span>
                              </span>
                          </div>
                          <span class="actions">
                              <span>${
                                commentDays > 13.999
                                  ? Math.round(commentWeeks) + " weeks"
                                  : commentDays > 6.999
                                  ? Math.round(commentWeeks) + " week"
                                  : commentHours > 47.99
                                  ? Math.round(commentDays) + " days"
                                  : commentHours > 23.99
                                  ? Math.round(commentDays) + " day"
                                  : commentMins > 119
                                  ? Math.round(commentHours) + " hours"
                                  : commentMins > 59
                                  ? Math.round(commentHours) + " hour"
                                  : commentSecs > 120
                                  ? Math.round(commentMins) + " mins"
                                  : commentSecs > 59
                                  ? Math.round(commentMins) + " min"
                                  : Math.round(commentSecs) + " secs"
                              }</span>
                              <!--<span> Like <i class="fa fa-thumbs-up"></i></span>-->
                              <span
                                  onclick="tagComment2('${newReplies._id}', '${
    newReplies.username
  }','${newReplies.message}', '${newReplies.uniqID}')">
                                  Reply <i class="fa fa-reply"></i></span>
                          </span>
                          ${newReplies.moreComments
                            .map((moreComment) => {
                              return `
                                  <div class="under-comments">
                                      <span class="user-avatar">
                                          <img src="../../../uploads/${moreComment.moreUserAvatar}" alt="">
                                      </span>
                                      <span>
                                          <b style="margin-right: 5px;">
                                              ${moreComment.moreUsername}
                                          </b>
                                          <span>
                                              ${moreComment.moreUserMessage}
                                          </span>
                                      </span>
                                  </div>
                                  `;
                            })
                            .join("")}
                              
                      </div>
                    </div>
                    <div id="newID${postID}" class="comment-form">
                            <div class="tag-comment tag-comment2" style="opacity: 0;">
                                <span><i class="fa fa-reply"></i></span>
                                <div class="right">
                                    <div class="comment-owner"></div>
                                    <div class="owner-comment"></div>
                                </div>
                                <span onclick="closeTagComment2()" style="cursor: pointer;"><i class="fa fa-times"></i></span>
                            </div>
                            <div class="text-muted submit-comment">
                                <input type="hidden" class="postID" name="postID" value="${postID}">
                                <input type="hidden" class="uniqID" name="uniqID" value="${
                                  newReplies.uniqID
                                }">
                                <input type="hidden" class="commentID" name="commentID" value="${
                                  newReplies._id
                                }">
                                <i class="fa fa-smile"></i>
                                <input type="text" required id="myReply" class="myReply" name="myReply" placeholder="Type your replies...">
                                <button onclick = "submitForm('${postID}', '${
    newReplies._id
  }', '${
    newReplies.uniqID
  }')" style="background: transparent; color: gray; cursor: pointer;">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                      </div>
  `;

  if (document.querySelector(".reply-container div")) {
    document.querySelector(".reply-container div").remove();
  }

  document.querySelector(".reply-container").appendChild(div);
}

socket.on("feedPostComments", (postedComments) => {
  displayComments(postedComments);
});

function displayComments(postedComments) {
  const feedID = postedComments._id;
  const smartNetworkComments = postedComments.comments.slice(-1);
  smartNetworkComments.forEach((comment) => {
    var div = document.createElement("div");

    div.classList.add("single-comment");
    div.innerHTML = `
                      <span class="user-avatar">
                                  <img src="../../../uploads/${comment.avatar}" alt="">
                      </span>
                      <span class="user">
                          <p>
                            <b style="margin-right: 5px;">
                              ${comment.username}
                            </b>
                          </p>
                          <span>${comment.message}</span>
                      </span>
                    `;
    document.querySelector(".feedpost" + feedID + " .caption").appendChild(div);
  });
}

socket.on("singleFeedPostComments", (postedComments) => {
  displaySingleFeedComments(postedComments);
});

function displaySingleFeedComments(postedComments) {
  const feedID = postedComments._id;
  const smartNetworkComments = postedComments.comments.slice(-1);
  smartNetworkComments.forEach((comment) => {
    var div = document.createElement("div");
    var commentID = comment._id;

    div.classList.add("comment-section");
    div.classList.add("comment" + commentID);
    div.innerHTML = `

                      <div class="single-comment">
                          <span class="user-avatar">
                            <img src="../../../uploads/${comment.avatar}" alt="">
                          </span>

                          <span class="user">
                              <p>
                                <b style="margin-right: 5px;">
                                  ${comment.username}
                                </b>
                              </p>
                              <span>${comment.message}</span>
                          </span>
                      </div>
                      <span class="actions">
                          <span>2 mins</span>
                          <span> Like <i class="fa fa-thumbs-up"></i></span>
                          <span onclick="tagComment('${comment._id}','${comment.username}','${comment.message}')"> 
                            Reply <i class="fa fa-reply"></i>
                          </span>
                      </span>
                      
                    `;
    document.querySelector(".feedpost" + feedID + " .caption").appendChild(div);
  });
}

// ===================Hide Bar================= //
var hideBar = document.querySelector(".hide-bar");
var sideBar = document.querySelector(".left");
var navContainer = document.querySelector("nav .container");
var container = document.querySelector("main .container");

var bodyContainer = document.querySelector("main .body-container");

hideBar.addEventListener("click", () => {
  navContainer.classList.toggle("sidebar-close");
  container.classList.toggle("sidebar-close");
  sideBar.classList.toggle("sidebar-close");
});

hideBar.addEventListener("click", () => {
  bodyContainer.classList.toggle("sidebar-close");
  sideBar.classList.toggle("sidebar-close");
});

// =================Active class=============== //

const menuItems = document.querySelectorAll(".menu-item");

const changeActiveItem = () => {
  menuItems.forEach((item) => {
    item.classList.remove("active");
  });
};

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    changeActiveItem();
    item.classList.add("active");

    if (item.id != "notifications") {
      document.querySelector(".notifications-popup").style.display = "none";
    } else {
      document.querySelector(".notifications-popup").style.display = "block";
      document.querySelector(
        "#notifications .notification-count"
      ).style.display = "none";
    }
  });
});

// =================Color Pallete==================== //
const colorPallete = document.querySelectorAll(".choose-color span");

const removeActiveColor = () => {
  colorPallete.forEach((color) => {
    color.classList.remove("active");
  });
};

colorPallete.forEach((color) => {
  color.addEventListener("click", async (e) => {
    e.preventDefault();

    let firstHue;
    let secondHue;
    let thirdHue;
    let colorTheme;

    removeActiveColor();

    if (color.classList.contains("color-1")) {
      firstHue = 173;
      secondHue = "36%";
      thirdHue = "55%";
      colorTheme = "green";
    } else if (color.classList.contains("color-2")) {
      firstHue = 37;
      secondHue = "76%";
      thirdHue = "74%";
      colorTheme = "yellow";
    } else if (color.classList.contains("color-3")) {
      firstHue = 252;
      secondHue = "75%";
      thirdHue = "60%";
      colorTheme = "purple";
    } else if (color.classList.contains("color-4")) {
      firstHue = 352;
      secondHue = "87.2%";
      thirdHue = "45.9%";
      colorTheme = "red";
    } else if (color.classList.contains("color-5")) {
      firstHue = 209;
      secondHue = "78%";
      thirdHue = "57.3%";
      colorTheme = "blue";
    }

    color.classList.add("active");

    root.style.setProperty("--first-color-hue", firstHue);
    root.style.setProperty("--second-color-hue", secondHue);
    root.style.setProperty("--third-color-hue", thirdHue);

    const response = await fetch("/dashboard/private/colorTheme", {
      method: "POST",
      body: JSON.stringify({ colorTheme }),
      headers: { "Content-Type": "application/json" },
    });
  });
});

// ==============Background Color================ //
const bg1 = document.querySelector(".bg-1");
const bg2 = document.querySelector(".bg-2");
const bg3 = document.querySelector(".bg-3");

let lightColorLightness;
let darkColorLightness;
let whiteColorLightness;

const changeBg = () => {
  root.style.setProperty("--light-color-lightness", lightColorLightness);
  root.style.setProperty("--dark-color-lightness", darkColorLightness);
  root.style.setProperty("--white-color-lightness", whiteColorLightness);
};

bg1.addEventListener("click", async (e) => {
  e.preventDefault();

  let background = "light";

  darkColorLightness = "17%";
  whiteColorLightness = "100%";
  lightColorLightness = "95%";

  bg1.classList.add("active");

  bg2.classList.remove("active");
  bg3.classList.remove("active");

  changeBg();

  const response = await fetch("/dashboard/private/background", {
    method: "POST",
    body: JSON.stringify({ background }),
    headers: { "Content-Type": "application/json" },
  });
});

bg2.addEventListener("click", async (e) => {
  e.preventDefault();

  let background = "dim";

  darkColorLightness = "95%";
  whiteColorLightness = "20%";
  lightColorLightness = "15%";

  bg2.classList.add("active");

  bg1.classList.remove("active");
  bg3.classList.remove("active");

  changeBg();

  const response = await fetch("/dashboard/private/background", {
    method: "POST",
    body: JSON.stringify({ background }),
    headers: { "Content-Type": "application/json" },
  });
});

bg3.addEventListener("click", async (e) => {
  e.preventDefault();

  let background = "dark";

  darkColorLightness = "95%";
  whiteColorLightness = "10%";
  lightColorLightness = "0%";

  bg3.classList.add("active");

  bg1.classList.remove("active");
  bg2.classList.remove("active");

  changeBg();

  const response = await fetch("/dashboard/private/background", {
    method: "POST",
    body: JSON.stringify({ background }),
    headers: { "Content-Type": "application/json" },
  });
});

//========================My Updates========================//
if (
  document.querySelector("#my-updates") &&
  document.querySelector(".updates")
) {
  const myUpdates = document.querySelector("#my-updates");
  const updates = document.querySelector(".updates");

  const openMyUpdates = () => {
    updates.style.display = "grid";
    startSlides();
  };

  const closeMyUpdates = (e) => {
    if (e.target.classList.contains("updates")) {
      updates.style.display = "none";
    }
  };

  const closeMyUpdatesTwo = (e) => {
    updates.style.display = "none";
  };

  myUpdates.addEventListener("click", openMyUpdates);
  updates.addEventListener("click", closeMyUpdates);

  var slideIndex = 0;
  var millis = 5000;
  var interval;

  function startSlides() {
    pauseSlides();
    nextSlide();
    interval = setInterval(nextSlide, millis);
  }

  function pauseSlides() {
    clearInterval(interval);
  }

  function nextSlide() {
    showSlide();
    slideIndex++;
  }

  function resumeSlides() {
    nextSlide();
  }

  function showSlide() {
    var i;
    var slides = document.getElementsByClassName("mySlide");

    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    if (slideIndex > slides.length) {
      slideIndex = 1;
    }

    if (slideIndex < 1) {
      slideIndex = slides.length;
    }

    slides[slideIndex - 1].style.display = "block";
  }

  var closeUpdate = document.querySelectorAll(".back-button");

  closeUpdate.forEach((item) => {
    item.addEventListener("click", closeMyUpdatesTwo);
  });
}

//=======================Contact List Modal========================//
if (
  document.querySelector("#contact-list") &&
  document.querySelector(".close-contact")
) {
  const contactList = document.querySelector("#contact-list");
  const contactListModal = document.querySelector(".contact-list");
  const closeContact = document.querySelector(".close-contact");

  const openContactListModal = () => {
    contactListModal.style.display = "grid";
  };

  const closeContactListModal = (e) => {
    if (e.target.classList.contains("contact-list")) {
      contactListModal.style.display = "none";
    }
  };

  const closeContactListModalTwo = () => {
    contactListModal.style.display = "none";
  };

  contactList.addEventListener("click", openContactListModal);
  contactListModal.addEventListener("click", closeContactListModal);
  closeContact.addEventListener("click", closeContactListModalTwo);
}

// ================Theme Customization========================== //
const theme = document.querySelector("#theme");
const themeModal = document.querySelector(".customize-theme");
const closeTheme = document.querySelector(".close-theme");

const openThemeModal = () => {
  themeModal.style.display = "grid";
};

const closeThemeModal = (e) => {
  if (e.target.classList.contains("customize-theme")) {
    themeModal.style.display = "none";
  }
};

const closeThemeModalTwo = () => {
  themeModal.style.display = "none";
};

theme.addEventListener("click", openThemeModal);
themeModal.addEventListener("click", closeThemeModal);
closeTheme.addEventListener("click", closeThemeModalTwo);

// ==============Font size========= //

var root = document.querySelector(":root");
const fontSizes = document.querySelectorAll(".choose-size span");

const removeSizeSelector = () => {
  fontSizes.forEach((size) => {
    size.classList.remove("active");
  });
};

fontSizes.forEach((size) => {
  size.addEventListener("click", async (e) => {
    e.preventDefault();

    // let screenWidth = screen.width;
    // alert(screenWidth);

    removeSizeSelector();
    let fontSize;
    size.classList.toggle("active");

    if (size.classList.contains("font-size-1")) {
      fontSize = "10px";
      root.style.setProperty("----sticky-top-left", "5.4rem");
      root.style.setProperty("----sticky-top-right", "5.4rem");
    } else if (size.classList.contains("font-size-2")) {
      fontSize = "13px";
      root.style.setProperty("----sticky-top-left", "5.4rem");
      root.style.setProperty("----sticky-top-right", "-7rem");
    } else if (size.classList.contains("font-size-3")) {
      fontSize = "15px";
      // if (screenWidth <= 400) {
      //   document.querySelector(".customize-theme .card").style.width = "80%";
      // }
      root.style.setProperty("----sticky-top-left", "-2rem");
      root.style.setProperty("----sticky-top-right", "-17rem");
    } else if (size.classList.contains("font-size-4")) {
      fontSize = "17px";
      root.style.setProperty("----sticky-top-left", "-5rem");
      root.style.setProperty("----sticky-top-right", "-25rem");
    }

    document.querySelector("html").style.fontSize = fontSize;

    const response = await fetch("/dashboard/private/fontSize", {
      method: "POST",
      body: JSON.stringify({ fontSize }),
      headers: { "Content-Type": "application/json" },
    });
  });
});

// ======================Filter Spaces========================= //
if (document.querySelector(".middle .space-body")) {
  if (document.querySelector(".middle #audio_space")) {
    const audioSpace = document.querySelector(".middle #audio_space");
    const audioSpaces = audioSpace.querySelectorAll(".audio-space-body");
    const middleMessageSearch = document.querySelector(
      "#audio_space #message-searchs"
    );

    const middleSearchMessage = () => {
      const vals = middleMessageSearch.value.toLowerCase();

      audioSpaces.forEach((user) => {
        let name = user.querySelector(".body h3").textContent.toLowerCase();
        if (name.indexOf(vals) != -1) {
          user.style.display = "block";
        } else {
          user.style.display = "none";
        }
      });
    };

    middleMessageSearch.addEventListener("keyup", middleSearchMessage);
  }

  if (document.querySelector(".middle #video_space")) {
    const videoSpace = document.querySelector(".middle #video_space");
    const videoSpaces = videoSpace.querySelectorAll(".v-body");
    const middleMessageSearch = document.querySelector(
      "#video_space #message-searchs"
    );

    const middleSearchMessage = () => {
      const vals = middleMessageSearch.value.toLowerCase();

      videoSpaces.forEach((user) => {
        let name = user.querySelector(".foot h3").textContent.toLowerCase();
        if (name.indexOf(vals) != -1) {
          user.style.display = "block";
        } else {
          user.style.display = "none";
        }
      });
    };

    middleMessageSearch.addEventListener("keyup", middleSearchMessage);
  }
}

// =================Hide and Show message Chatroom =================//
if (document.querySelectorAll(".middle .message")) {
  const chatLists = document.querySelectorAll(".middle .message");

  chatLists.forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelector(".middle").classList.add("open-chat");
    });
  });

  if (document.querySelector(".close-chat")) {
    var closeChat = document.querySelector(".close-chat");

    closeChat.addEventListener("click", function () {
      document.querySelector(".middle").classList.remove("open-chat");
    });
  }
}

// =================Filter Messages====================//
if (document.querySelector(".right .messages")) {
  const message = document.querySelector(".right .messages");
  const messages = message.querySelectorAll(".message");
  if (document.querySelector("#message-searchs")) {
    const messageSearch = document.querySelector("#message-searchs");
    const searchMessage = () => {
      const val = messageSearch.value.toLowerCase();

      messages.forEach((user) => {
        let name = user.querySelector("h5").textContent.toLowerCase();
        if (name.indexOf(val) != -1) {
          user.style.display = "flex";
        } else {
          user.style.display = "none";
        }
      });
    };
    messageSearch.addEventListener("keyup", searchMessage);
  }
}

if (document.querySelector(".middle .messages")) {
  const middleMessage = document.querySelector(".middle .messages");
  const middleMessages = middleMessage.querySelectorAll(".message");
  if (document.querySelector("#message-search")) {
    const middleMessageSearch = document.querySelector("#message-search");
    const middleSearchMessage = () => {
      const vals = middleMessageSearch.value.toLowerCase();

      middleMessages.forEach((user) => {
        let name = user.querySelector("h5").textContent.toLowerCase();
        if (name.indexOf(vals) != -1) {
          user.style.display = "flex";
        } else {
          user.style.display = "none";
        }
      });
    };

    middleMessageSearch.addEventListener("keyup", middleSearchMessage);
  }
}

// =====================Switch Tabs====================== //
function openTab(event, tabName) {
  var i, postFeeds, tablinks;

  postFeeds = document.getElementsByClassName("postFeeds");

  for (i = 0; i < postFeeds.length; i++) {
    postFeeds[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");

  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("active", "");
  }

  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}
function openTab2(event, tabName) {
  var i, postFeeds2, tablinks;

  postFeeds2 = document.getElementsByClassName("postFeeds2");

  for (i = 0; i < postFeeds2.length; i++) {
    postFeeds2[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks2");

  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("active", "");
  }

  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}
function openTab3(event, tabName) {
  var i, postFeeds2, tablinks;

  postFeeds2 = document.getElementsByClassName("postFeeds3");

  for (i = 0; i < postFeeds2.length; i++) {
    postFeeds2[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks3");

  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("active", "");
  }

  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}

// =======================Closetabs in Forum=====================//
function closeTag() {
  var closeForum = document.getElementById("close-forums");
  var forumHead = document.getElementById("forum-heading");
  var angle1 = document.querySelector(".angle1");
  var angle2 = document.querySelector(".angle2");

  if (closeForum.style.display === "block") {
    closeForum.style.display = "none";
    forumHead.style.borderBottom = "none";
    forumHead.style.paddingBottom = "0";
    forumHead.style.marginBottom = "0.3rem";
    angle1.style.display = "none";
    angle2.style.display = "block";
  } else {
    closeForum.style.display = "block";
    forumHead.style.borderBottom = "1px solid var(--color-light)";
    forumHead.style.paddingBottom = "15px";
    forumHead.style.marginBottom = "1rem";
    angle1.style.display = "block";
    angle2.style.display = "none";
  }
}

// ===============Toggle Image======================= //
function toggleImg(obj) {
  obj.classList.toggle("toggle");
}

// =====================Live Spaces==================== //
function videoSpace2(e) {
  var videoSpace = document.querySelector(".video-space-modal");
  videoSpace.style.display = "grid";
  document.getElementById("hiddenMovieID").value = e;
  document.getElementById("hiddenMovieID2").value = e;
}

function closeVideoSpaceModal2(e) {
  if (e.classList.contains("video-space-modal")) {
    e.style.display = "none";
  }
}

function closeVideoSpaceModalTwo2() {
  var videoSpace = document.querySelector(".video-space-modal");
  videoSpace.style.display = "none";
  document.getElementById("hiddenMovieID").value = "";
}

function videoSpace3(e) {
  var videoSpace = document.querySelector(".v2-modal");
  videoSpace.style.display = "grid";
  document.getElementById("hiddenMovieID3").value = e;
  document.getElementById("hiddenMovieID4").value = e;
}

function closeVideoSpaceModalTwo3() {
  var videoSpace = document.querySelector(".v2-modal");
  videoSpace.style.display = "none";
  document.getElementById("hiddenMovieID3").value = "";
}

function videoSpace4(e) {
  var videoSpace = document.querySelector(".v3-modal");
  videoSpace.style.display = "grid";
  document.getElementById("hiddenMovieID5").value = e;
  document.getElementById("hiddenMovieID6").value = e;
}

function closeVideoSpaceModalTwo4() {
  var videoSpace = document.querySelector(".v3-modal");
  videoSpace.style.display = "none";
  document.getElementById("hiddenMovieID5").value = "";
}

function videoSpace() {
  var videoSpace = document.querySelector(".video-space-modal");
  videoSpace.style.display = "grid";
}

function closeVideoSpaceModal(e) {
  if (e.classList.contains("video-space-modal")) {
    e.style.display = "none";
  }
}

function closeVideoSpaceModalTwo() {
  var videoSpace = document.querySelector(".video-space-modal");
  videoSpace.style.display = "none";
}

function space() {
  var createSpace = document.querySelector(".create-space");
  createSpace.style.display = "grid";
}

function closeSpaceModal(e) {
  if (e.classList.contains("create-space")) {
    e.style.display = "none";
  }
}

function closeSpaceModalTwo() {
  var createSpace = document.querySelector(".create-space");
  createSpace.style.display = "none";
}

function updateOption(obj) {
  const selected = document.querySelector(".selected");
  var optionsContainer = document.querySelector(".options-container");

  selected.innerHTML =
    obj.querySelector("label").innerHTML +
    " <span class='fa fa-angle-down angle1'></span><span class='fa fa-angle-up angle2'></span>";

  optionsContainer.classList.remove("active");

  if (document.getElementById("myForum")) {
    if (document.getElementById("myForum").checked) {
      document.getElementById("myForums").style.display = "block";
    } else {
      document.getElementById("myForums").style.display = "none";
    }
  } else if (document.getElementById("myVideoForum")) {
    if (document.getElementById("myVideoForum").checked) {
      document.getElementById("myForums").style.display = "block";
    } else {
      document.getElementById("myForums").style.display = "none";
    }
  } else if (document.getElementById("others")) {
    if (document.getElementById("others").checked) {
      document.getElementById("category-text").style.display = "flex";
    } else {
      document.getElementById("category-text").style.display = "none";
    }
  }
}

function updateOption2(obj) {
  const selected2 = document.querySelector(".selected2");
  var optionsContainerForum = document.querySelector(
    ".options-container-forum"
  );

  selected2.innerHTML =
    obj.querySelector("label").innerHTML +
    " <span class='fa fa-angle-down angle3'></span><span class='fa fa-angle-up angle4'></span>";
  optionsContainerForum.classList.remove("active");
}

function updateVideoOption(obj) {
  const selected = document.querySelector(".selected");
  var optionsContainer2 = document.querySelector(".options-container2");

  selected.innerHTML =
    obj.querySelector("label").innerHTML +
    " <span class='fa fa-angle-down angle1'></span><span class='fa fa-angle-up angle2'></span>";

  optionsContainer2.classList.remove("active");

  if (document.getElementById("myVideoForum")) {
    if (document.getElementById("myVideoForum").checked) {
      document.getElementById("myVideoForums").style.display = "block";
    } else {
      document.getElementById("myVideoForums").style.display = "none";
    }
  }
}

function updateVideoOption2(obj) {
  const selected2 = document.querySelector(".selected2");
  var optionsContainerVideoForum = document.querySelector(
    ".options-container-video-forum"
  );

  selected2.innerHTML =
    obj.querySelector("label").innerHTML +
    " <span class='fa fa-angle-down angle3'></span><span class='fa fa-angle-up angle4'></span>";
  optionsContainerVideoForum.classList.remove("active");
}

function toggleSpace() {
  var optionsContainer = document.querySelector(".options-container");

  optionsContainer.classList.toggle("active");

  if (optionsContainer.classList.contains("active")) {
    document.querySelector(".selected .angle1").style.display = "none";
    document.querySelector(".selected .angle2").style.display = "block";
  } else {
    document.querySelector(".selected .angle1").style.display = "block";
    document.querySelector(".selected .angle2").style.display = "none";
  }
}

function toggleSpace2() {
  var optionsContainerForum = document.querySelector(
    ".options-container-forum"
  );

  optionsContainerForum.classList.toggle("active");

  if (optionsContainerForum.classList.contains("active")) {
    document.querySelector(".selected2 .angle3").style.display = "none";
    document.querySelector(".selected2 .angle4").style.display = "block";
  } else {
    document.querySelector(".selected2 .angle3").style.display = "none";
    document.querySelector(".selected2 .angle4").style.display = "block";
  }
}

function toggleVideoSpace() {
  var optionsContainer2 = document.querySelector(".options-container2");

  optionsContainer2.classList.toggle("active");

  if (optionsContainer2.classList.contains("active")) {
    document.querySelector(".selected .angle1").style.display = "none";
    document.querySelector(".selected .angle2").style.display = "block";
  } else {
    document.querySelector(".selected .angle1").style.display = "block";
    document.querySelector(".selected .angle2").style.display = "none";
  }
}

function toggleVideoSpace2() {
  var optionsContainerVideoForum = document.querySelector(
    ".options-container-video-forum"
  );

  optionsContainerVideoForum.classList.toggle("active");

  if (optionsContainerVideoForum.classList.contains("active")) {
    document.querySelector(".selected2 .angle3").style.display = "none";
    document.querySelector(".selected2 .angle4").style.display = "block";
  } else {
    document.querySelector(".selected2 .angle3").style.display = "none";
    document.querySelector(".selected2 .angle4").style.display = "block";
  }
}
function a() {
  var b = document.getElementById("record");
  if (b.checked == true) {
    b.checked = false;
  }
}
function b() {
  var a = document.getElementById("check");
  if (a.checked == true) {
    a.checked = false;
  }
}
function displayHelpBox() {
  document.querySelector(".help-box").style.display = "block";
}
function undisplayHelpBox() {
  document.querySelector(".help-box").style.display = "none";
}

// ================Help Questions =============== //
function closeQuestion(e) {
  var questionOne = document.getElementById("question-one");
  questionOne.classList.toggle("close");

  if (e.classList.contains("fa-plus")) {
    e.classList.replace("fa-plus", "fa-minus");
  } else {
    e.classList.replace("fa-minus", "fa-plus");
  }
}
function closeQuestionTwo(e) {
  var questionTwo = document.getElementById("question-two");
  questionTwo.classList.toggle("close");

  if (document.querySelector("#question-two .answer").style.display == "none") {
    document.querySelector("#question-two .answer").style.display = "block";
  } else {
    document.querySelector("#question-two .answer").style.display = "none";
  }

  if (e.classList.contains("fa-plus")) {
    e.classList.replace("fa-plus", "fa-minus");
  } else {
    e.classList.replace("fa-minus", "fa-plus");
  }
}
function closeQuestionThree(e) {
  var questionThree = document.getElementById("question-three");
  questionThree.classList.toggle("close");

  if (
    document.querySelector("#question-three .answer").style.display == "none"
  ) {
    document.querySelector("#question-three .answer").style.display = "block";
  } else {
    document.querySelector("#question-three .answer").style.display = "none";
  }

  if (e.classList.contains("fa-plus")) {
    e.classList.replace("fa-plus", "fa-minus");
  } else {
    e.classList.replace("fa-minus", "fa-plus");
  }
}
function closeAccount(e) {
  var accountOne = document.getElementById("account-one");
  accountOne.classList.toggle("close");

  if (e.classList.contains("fa-plus")) {
    e.classList.replace("fa-plus", "fa-minus");
  } else {
    e.classList.replace("fa-minus", "fa-plus");
  }
}
function closeAccountTwo(e) {
  var accountTwo = document.getElementById("account-two");
  accountTwo.classList.toggle("close");

  if (document.querySelector("#account-two .answer").style.display == "none") {
    document.querySelector("#account-two .answer").style.display = "block";
  } else {
    document.querySelector("#account-two .answer").style.display = "none";
  }

  if (e.classList.contains("fa-plus")) {
    e.classList.replace("fa-plus", "fa-minus");
  } else {
    e.classList.replace("fa-minus", "fa-plus");
  }
}
function closeAccountThree(e) {
  var accountThree = document.getElementById("account-three");
  accountThree.classList.toggle("close");

  if (
    document.querySelector("#account-three .answer").style.display == "none"
  ) {
    document.querySelector("#account-three .answer").style.display = "block";
  } else {
    document.querySelector("#account-three .answer").style.display = "none";
  }

  if (e.classList.contains("fa-plus")) {
    e.classList.replace("fa-plus", "fa-minus");
  } else {
    e.classList.replace("fa-minus", "fa-plus");
  }
}

// ================== Help Center====================== //
function altEmail() {
  document.getElementById("alt-email").style.display = "flex";
}

function closeAltEmail() {
  document.getElementById("alt-email").style.display = "none";
}

// ====================Show Profile======================= //
function showProfile() {
  document.querySelector(".user-chatroom").classList.add("show-profile");
}
function closeProfile() {
  document
    .querySelector(".user-chatroom")
    .classList.replace("show-profile", "close-profile");
}

function deletePlaylist(playlistID) {
  socket.emit("deletePlaylist", playlistID);
  document.querySelector(".vid-list3" + playlistID).remove();

  if (document.querySelector(".option" + playlistID))
    document.querySelector(".option" + playlistID).remove();
}

function subscribe() {
  var subscribeBtn = document.getElementById("subscribe-btn");

  if (subscribeBtn.classList.contains("btn-primary")) {
    subscribeBtn.textContent = "Unsubscribe";
    subscribeBtn.classList.replace("btn-primary", "btn-gray");

    var oldSubscribers = Number(
      document.getElementById("no_subscribers").textContent
    );
    var newSubscribers = (oldSubscribers += 1);

    document.getElementById("no_subscribers").textContent = newSubscribers;

    var userID = "<%= user._id %>";
    var channelID = "<%= channel._id %>";

    socket.emit("subscribe", { userID, channelID });
  } else {
    subscribeBtn.textContent = "Subscribe";
    subscribeBtn.classList.replace("btn-gray", "btn-primary");

    var oldSubscribers = Number(
      document.getElementById("no_subscribers").textContent
    );
    var newSubscribers = oldSubscribers - 1;

    document.getElementById("no_subscribers").textContent = newSubscribers;

    var userID = "<%= user._id %>";
    var channelID = "<%= channel._id %>";

    socket.emit("unSubscribe", { userID, channelID });
  }
}

function showPlaylistVideos(playlistID) {
  socket.emit("showPlaylistVideos", playlistID);

  socket.on("receiveShowPlaylistVideos", (response) => {
    displayPlaylistVideos(response);
  });
}

function backToPlaylists() {
  document.querySelector(".channel-body").style.display = "block";
  document.querySelector(".playlist-body").style.display = "none";
}

function removeFromPlaylist(movieID, playlistID) {
  socket.emit("removeFromPlaylist", { movieID, playlistID });

  newVideoCount =
    Number(document.querySelector(".playlistLength" + playlistID).textContent) -
    1;
  document.querySelector(".playlistLength" + playlistID).textContent =
    newVideoCount;

  if (newVideoCount <= 1) {
    document.querySelector(".the_S").textContent = "";
  }

  document.querySelector(".vid-list2" + movieID).remove();
}

function copyVideoLink(obj, movieID, box) {
  navigator.clipboard.writeText(obj);

  if (box === "box1") {
    document.querySelector(".box" + movieID).style.display = "none";
  } else if (box === "box2") {
    document.querySelector(".box2" + movieID).style.display = "none";
  }

  successAlert.style.display = "block";
  successAlertIcon.className = "";
  successAlertIcon.className = "fa fa-clipboard";
  successMessage.textContent = "Link Copied";

  setTimeout(() => {
    successAlert.style.display = "none";
  }, 3000);
}

function showActionBox(id) {
  if (document.querySelector(".box" + id).style.display === "none") {
    document.querySelector(".box" + id).style.display = "block";
  } else {
    document.querySelector(".box" + id).style.display = "none";
  }
}

function showActionBox2(id) {
  if (document.querySelector(".box2" + id).style.display === "none") {
    document.querySelector(".box2" + id).style.display = "block";
  } else {
    document.querySelector(".box2" + id).style.display = "none";
  }
}

function showField() {
  if (document.getElementById("add-to-playlist").checked) {
    document.querySelector(".space-form3").style.display = "block";
    document.querySelector(".space-form4").style.display = "none";
  } else {
    document.querySelector(".space-form3").style.display = "none";
    document.querySelector(".space-form4").style.display = "block";
  }
}

function showField2() {
  if (document.getElementById("add-to-playlist2").checked) {
    document.querySelector(".space-form5").style.display = "block";
    document.querySelector(".space-form6").style.display = "none";
  } else {
    document.querySelector(".space-form5").style.display = "none";
    document.querySelector(".space-form6").style.display = "block";
  }
}

function deleteMovies(movieID) {
  if (confirm("Are you sure you want to delete this movie?")) {
    socket.emit("deleteMovie", {
      movieID,
      thumbnailID,
      fileUploadID,
    });
  }
}

function showPreview(event) {
  if (event.target.files.length > 0) {
    var src = URL.createObjectURL(event.target.files[0]);
    var preview = document.getElementById("img-preview");
    preview.src = src;
    document.querySelector(".btn.btn-primary.update-logo").style.display =
      "block";
  }
}

function showUpdateButton() {
  if (
    (document.getElementById("channel-name").value ||
      document.getElementById("channel-description").value) !== ""
  ) {
    document.querySelector(".update-channel").style.display = "block";
  } else {
    document.querySelector(".update-channel").style.display = "none";
  }
}

function copyPlaylistLink(obj) {
  navigator.clipboard.writeText(obj);

  successAlert.style.display = "block";
  successAlertIcon.className = "";
  successAlertIcon.className = "fa fa-clipboard";
  successMessage.textContent = "Link Copied";

  setTimeout(() => {
    successAlert.style.display = "none";
  }, 3000);
}

if (document.querySelector(".dots-btn")) {
  document.querySelector(".dots-btn").addEventListener("click", () => {
    document.querySelector(".action-bar").classList.toggle("change-dot");
  });
}

function tagComment2(id, user, comment, uniqID) {
  const tagComment = document.querySelector(".tag-comment2");
  const commentOwner = document.querySelector(".tag-comment2 .comment-owner");
  const ownerComment = document.querySelector(".tag-comment2 .owner-comment");

  tagComment.style.opacity = "1";

  commentOwner.textContent = "replying to @" + user;
  ownerComment.textContent = comment;
}

function closeTagComment2() {
  const tagComment = document.querySelector(".tag-comment2");

  const commentOwner = document.querySelector(".tag-comment2 .comment-owner");
  const ownerComment = document.querySelector(".tag-comment2 .owner-comment");

  tagComment.style.opacity = "0";

  commentOwner.textContent = "";
  ownerComment.textContent = "";
}

function closeActionBox(id) {
  document.querySelector(".box" + id).style.display = "none";
}

function startRoom(roomID) {
  socket.emit("startMyRoom", roomID);
}

function joinRoomMeeting(userID) {
  var roomID = document.getElementById("joinRoomID").value;
  document.getElementById("joinRoomID").value = "";
  socket.emit("joinRoom", roomID, userID);
}

// function startRoomMeeting(roomID, userID, username) {
//   socket.emit("start_or_join_room", roomID, userID, username);
// }

// function onAddStream(event) {
//   if (roomHost === myID) {
//     const memberFrame = document.createElement("div");
//     memberFrame.classList.add("member-frame");
//     memberFrame.setAttribute("id", myID);
//     memberFrame.setAttribute(
//       "onmouseenter",
//       `showVideoButtons2('show', '${myID}')`
//     );
//     memberFrame.setAttribute(
//       "onmouseleave",
//       `showVideoButtons2('hide', '${myID}')`
//     );
//     memberFrame.innerHTML = `
//           <div class="actions">
//               <span><i class="fa-solid fa-phone-slash"></i></span>
//               <span><i class="fa-solid fa-video-slash"></i></span>
//               <span><i class="fa fa-microphone-lines"></i></span>
//               </div>
//           `;

//     const memberVideo = document.createElement("video");
//     memberVideo.muted = true;
//     memberVideo.srcObject = event.streams[0];
//     memberVideo.addEventListener("loadedmetadata", () => {
//       memberVideo.play();
//     });

//     memberFrame.appendChild(memberVideo);
//     memberFrames.appendChild(memberFrame);
//   } else {
//     hostVideo.muted = true;
//     hostVideo.srcObject = event.streams[0];
//     hostVideo.addEventListener("loadedmetadata", () => {
//       hostVideo.play();
//     });
//     hostFrame.style.display = "block";
//   }
//   var frameArray = [];
//   document.querySelectorAll(".member-frame").forEach((item) => {
//     if (item.id === myID) {
//       frameArray.push(item);
//     }
//   });

//   for (let i = 1; i < frameArray.length; i++) {
//     frameArray[i].remove();
//   }

//   // remoteStream = event.streams[0];
// }

// function onAddStreamTwo(event) {
//   if (roomHost === myID) {
//     const memberFrame = document.createElement("div");
//     memberFrame.classList.add("member-frame");
//     memberFrame.setAttribute("id", myID);
//     memberFrame.setAttribute(
//       "onmouseenter",
//       `showVideoButtons2('show', '${myID}')`
//     );
//     memberFrame.setAttribute(
//       "onmouseleave",
//       `showVideoButtons2('hide', '${myID}')`
//     );
//     memberFrame.innerHTML = `
//           <div class="actions">
//               <span><i class="fa-solid fa-phone-slash"></i></span>
//               <span><i class="fa-solid fa-video-slash"></i></span>
//               <span><i class="fa fa-microphone-lines"></i></span>
//               </div>
//           `;

//     const memberVideo = document.createElement("video");
//     memberVideo.muted = true;
//     memberVideo.srcObject = event.streams[0];
//     memberVideo.addEventListener("loadedmetadata", () => {
//       memberVideo.play();
//     });

//     memberFrame.appendChild(memberVideo);
//     memberFrames.appendChild(memberFrame);
//   } else {
//     hostVideo.muted = true;
//     hostVideo.srcObject = event.streams[0];
//     hostVideo.addEventListener("loadedmetadata", () => {
//       hostVideo.play();
//     });
//     hostFrame.style.display = "block";
//   }

//   remoteStream = event.streams[0];
// }

// function onIceCandidate(event) {
//   if (event.candidate) {
//     console.log("Sending Ice Candidates... " + event.candidate);
//     socket.emit("candidate", {
//       type: "candidate",
//       label: event.candidate.sdpMLineIndex,
//       id: event.candidate.sdpMid,
//       candidate: event.candidate.candidate,
//       roomID: roomNumber,
//     });
//   }
// }

function showChannelchat(obj) {
  var a = obj.querySelector(".icon-1");
  var b = obj.querySelector(".icon-2");
  var container = document.querySelector(".channel-chat-container");

  if (a.style.display === "block") {
    container.style.display = "block";
    container.style.animation = "showChannelchat 0.7s";
    a.style.display = "none";
    b.style.display = "block";
  } else {
    container.style.display = "none";
    a.style.display = "block";
    b.style.display = "none";
  }
}

function minimize() {
  var a = document.querySelector(".channel-chat-float .icon-1");
  var b = document.querySelector(".channel-chat-float .icon-2");
  var container = document.querySelector(".channel-chat-container");

  container.style.display = "none";
  a.style.display = "block";
  b.style.display = "none";
}

function showVideoButtons(obj) {
  var action = document.querySelector(".host-frame .actions");
  if (obj === "show") {
    action.style.animationName = "previewButtons";
    action.style.display = "flex";
  } else {
    action.style.display = "none";
    action.style.animationName = "";
  }
}
function showVideoButtons2(obj, event) {
  var memberFrame = document.getElementById(event);
  var action = memberFrame.querySelector(".actions");
  if (obj === "show") {
    action.style.animationName = "previewButtonsTwo";
    action.style.display = "flex";
  } else {
    action.style.display = "none";
    action.style.animationName = "";
  }
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function actionRedirect(bookmark, type) {
  if (type == "bookmarks") {
    if (bookmark == "false") {
      dangerAlert.style.display = "block";
      dangerMessage.textContent = "You have no bookmark.";

      setTimeout(() => {
        dangerAlert.style.display = "none";
      }, 5000);
    } else {
      window.location.href = "/dashboard/private/smart_network/bookmarks";
    }
  } else {
    if (bookmark == "0") {
      dangerAlert.style.display = "block";
      dangerMessage.textContent = "You have no liked posts.";

      setTimeout(() => {
        dangerAlert.style.display = "none";
      }, 5000);
    } else {
      window.location.href = "/dashboard/private/smart_network/likes";
    }
  }
}

if (document.querySelector("#addPost")) {
  const addPost = document.querySelector("#addPost");
  const addPostModal = document.querySelector(".add-post-modal");
  const closeAddPost = document.querySelector(".close-addPost");

  const openAddPostModal = () => {
    addPostModal.style.display = "grid";
  };

  const closeaddPostModal = (e) => {
    if (e.target.classList.contains("add-post-modal")) {
      addPostModal.style.display = "none";
    }
  };

  const closeaddPostModalTwo = () => {
    addPostModal.style.display = "none";
  };

  addPost.addEventListener("click", openAddPostModal);
  addPostModal.addEventListener("click", closeaddPostModal);
  closeAddPost.addEventListener("click", closeaddPostModalTwo);
}

// var IDLE_TIMEOUT = 1 * 60;
// var _idleSecondsCounter = 0;
// document.onclick = function () {
//   _idleSecondsCounter = 0;
// };
// document.onmousemove = function () {
//   _idleSecondsCounter = 0;
// };
// document.onkeypress = function () {
//   _idleSecondsCounter = 0;
// };
// window.setInterval(CheckIdleTime, 1000);

// function CheckIdleTime() {
//   if (_idleSecondsCounter >= IDLE_TIMEOUT) {
//     document.location.href = "/dashboard/lockscreen";
//   } else {
//     _idleSecondsCounter++;
//   }
// }
