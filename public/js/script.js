hljs.highlightAll();
const publicVapidKey = 'BHgOt-MxnO-RuLibIpfv1CXbxpKX08ksS9Xld8YJ6pTGQwpdV46DAqNtSYsV8Pz8iOAi1Ip0nc0dbI_yilqOAaU'

// addEventListener("load", async () => {
//   await
navigator.serviceWorker.register('/worker.js')
.then(reg => console.log('SW registered!', reg))
.catch(err => console.log('Boo!', err));
// })

// document.addEventListener('touchstart', function(e){
//     // document.innerHTML = ''
//     var touchobj = e.changedTouches[0]
//     dist = 0
//     startX = touchobj.pageX
//     startY = touchobj.pageY
//     startTime = new Date().getTime() // record time when finger first makes contact with surface
//     e.preventDefault()

//     console.log(touchobj, dist, startX, startY, startTime)
// }, false)

// document.addEventListener('touchmove', function(e){
//     e.preventDefault() // prevent scrolling when inside DIV
// }, false)
/*
===================================================================================================
********************************************FILE CONTENTS******************************************
-- Load Contacts
===================================================================================================
*/

if (document.getElementById("defaultOpen")) {
    document.getElementById("defaultOpen").click();
}

if (document.getElementById("defaultOpen2")) {
    document.getElementById("defaultOpen2").click();
}
if (document.getElementById("defaultOpen4")) {
    document.getElementById("defaultOpen4").click();
}
if (document.getElementById("defaultOpen5")) {
    document.getElementById("defaultOpen5").click();
}
if (document.getElementById("defaultOpen6")) {
    document.getElementById("defaultOpen6").click();
}
if (document.getElementById("defaultOpen7")) {
    document.getElementById("defaultOpen7").click();
}

setTimeout(() => {
    if (document.getElementById("defaultOpen3")) {
        document.getElementById("defaultOpen3").click();
    }
}, 5000);

/*
===================================================================================================
Initiate Socket IO
===================================================================================================
*/
const socket = io();

/*
===================================================================================================
****************************************LOAD CONTACTS**********************************************
-- Get user ID and initiate loadContacts function
-- The function loadContactsInit() emits "loadContacts" with socket IO and loads contacts, friends lists using User ID
-- The socket.on "contactsReady" receives contacts from backend and initiate function loadContacts()
-- The function loadContacts() appends loaded contacts to the frontend
===================================================================================================
*/
if (theUserID) loadContactsInit(theUserID);

function loadContactsInit(userID) {
    socket.emit("loadContacts", userID);
}

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
    ${contactsArray != "empty"
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
    .join(""): `
    <div class="postFeed-body">
    <span class="text-muted">You have no records</span>
    </div>
    `
    }
    </div>
    <div class="postFeeds3" id="mayKnow">
    ${mayKnow != "empty"
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
    .join(""): `
    <div class="postFeed-body">
    <span class="text-muted">You have no records</span>
    </div>
    `
    }
    </div>
    <div class="postFeeds3" id="requests">
    ${requestsArray != "empty"
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
    .join(""): `
    <div class="postFeed-body">
    <span class="text-muted">You have no records</span>
    </div>`
    }
    </div>
    <div class="postFeeds3" id="outgoing">
    ${requestsArray != "empty"
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
    .join(""): `
    <div class="postFeed-body">
    <span class="text-muted">You have no records</span>
    </div>`
    }
    </div>
    <div class="postFeeds3" id="declinedRequests">
    ${declinedArray != "empty"
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
    .join(""): `
    <div class="postFeed-body">
    <span class="text-muted">You have no records</span>
    </div>`
    }
    </div>
    <div class="postFeeds3" id="blocked">
    ${blockedArray != "empty"
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
    .join(""): `<div class="postFeed-body">
    <span class="text-muted">You have no records</span>
    </div>`
    }
    </div>
    `;
    document.getElementById("contact-list-feed").appendChild(div);
}

/*
===================================================================================================
******************************************LOCK SCREEN**********************************************
-- The function lockScreen() emits "lockScreen" to the backend and redirects to lockscreen page
-- The socket.on "passwordStatus" verifies user password and unlocks screen
===================================================================================================
*/
function lockScreen(userID) {
    socket.emit("lockscreen",
        userID);
    window.location.href = "/dashboard/lockscreen";
}

socket.on("passwordStatus", (status) => {
    if (status == "invalid") {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "Invalid Password";

        setTimeout(() => {
            dangerAlert.style.display = "flex";
        }, 5000);
    } else {
        window.location.href = "/dashboard/index";
    }
});

/*
===================================================================================================
******************************************BLOCK USERS**********************************************
===================================================================================================
*/

let blockUserEmit = (userID, friendID, type) => {
    if (type == "unblock") {
        socket.emit("unBlockUserEmit", {
            userID, friendID
        });
    } else {
        socket.emit("blockUserEmit", {
            userID, friendID
        });
    }
};

/*
===================================================================================================
******************************************ADD USERS AS FRIENDS*************************************
===================================================================================================
*/

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
        socket.emit("addFriend", {
            userID, friendID
        });
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
        socket.emit("cancelRequest", {
            userID, friendID
        });
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
        socket.emit("cancelRequest", {
            userID, friendID
        });
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
        socket.emit("addFriend", {
            userID, friendID
        });
    }
};

/*
===================================================================================================
***************************************UPDATE FRIEND REQUESTS**************************************
-- Accept and Decline Requests
===================================================================================================
*/

var updateFriendRequest = (userID, id, type) => {
    if (type === "accept") {
        socket.emit("acceptRequest", {
            userID, id
        });
        if (document.getElementById(id)) document.getElementById(id).remove();

        if (document.querySelectorAll(".friend-requests .request").length <= 0) {
            document.querySelector(".friend-requests").style.display = "none";
        }
    } else {
        socket.emit("declineRequest", {
            userID, id
        });
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

/*
===================================================================================================
******************************************LIVE MEETING*********************************************
-- Show Information about a Meeting
-- Cancel a Meeting
-- End Meeting
===================================================================================================
*/

function showMeetingDetails(roomID) {
    socket.emit("showMeetingDetails", roomID);
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

function closeViewMeeting() {
    const viewMeeting = document.querySelector(".view-meeting");
    viewMeeting.innerHTML = "";
    viewMeeting.style.display = "none";
}

/*
===================================================================================================
******************************************CHAT SYSTEM*************************************
===================================================================================================
*/

socket.on("newChatMessage", (response) => {
    displayMessage(response);
});

socket.on("chatRoomMessages", (response) => {
    displayChatRoom(response);
});

/*
===================================================================================================
******************************************MOVIES TAB**********************************************
===================================================================================================
*/

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
        <div class="vid-list3" onclick="showPlaylistVideos('${playlist._id
        }')">
        <div class="thumbnails">
        ${playlist.movies.length > 1
        ? `
        <img src="${playlistMovies1.thumbnail}" alt="" class="thumbnail-1">
        <img src="${playlistMovies2.thumbnail}" alt="" class="thumbnail-2">`: playlist.movies.length > 0
        ? `
        <img src="${playlistMovies1.thumbnail}" alt="" class="thumbnail-1">`: ""
        }
        </div>
        <div class="shadow">
        <span style="color: var(--color-primary); class="fa fa-play-circle-o"></span>
        <h4 style="color: var(--color-primary);>${playlist.playlistName
        } <br>
        <span style="color: var(--color-primary); class="text-muted">${playlist.movies.length
        } Video${playlist.movies.length > 1 ? "s": ""
        }</span></h4>
        </div>
        </div>
        <button class="btn" onclick="deletePlaylist('${playlist._id
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
    div2.setAttribute("onclick",
        "updateVideoOption(this)");

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
    div2.setAttribute("onclick",
        "updateVideoOption2(this)");

    div2.innerHTML = `
    <input type="radio" value="${playlist._id}" name="playlist2" class="radio">
    <label for="${playlist.playlistName}">${playlist.playlistName}</label>
    `;

    document.querySelector(".options-container-video-forum").appendChild(div2);
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
    <img src="../../../uploads/${newReplies.avatar
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
    <span>${commentDays > 13.999
    ? Math.round(commentWeeks) + " weeks": commentDays > 6.999
    ? Math.round(commentWeeks) + " week": commentHours > 47.99
    ? Math.round(commentDays) + " days": commentHours > 23.99
    ? Math.round(commentDays) + " day": commentMins > 119
    ? Math.round(commentHours) + " hours": commentMins > 59
    ? Math.round(commentHours) + " hour": commentSecs > 120
    ? Math.round(commentMins) + " mins": commentSecs > 59
    ? Math.round(commentMins) + " min": Math.round(commentSecs) + " secs"
    }</span>
    <!--<span> Like <i class="fa fa-thumbs-up"></i></span>-->
    <span
    onclick="tagComment2('${newReplies._id}', '${newReplies.username
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
    <input type="hidden" class="uniqID" name="uniqID" value="${newReplies.uniqID
    }">
    <input type="hidden" class="commentID" name="commentID" value="${newReplies._id
    }">
    <i class="fa fa-smile"></i>
    <input type="text" required id="myReply" class="myReply" name="myReply" placeholder="Type your replies...">
    <button onclick = "submitForm('${postID}', '${newReplies._id
    }', '${newReplies.uniqID
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

/*
===================================================================================================
*****************************************FRONTEND DISPLAY*****************************************
===================================================================================================
*/

// =========================Hide Bar===================== //
var hideBar = document.querySelector(".hide-bar");
var sideBar = document.querySelector(".left");

/*
====================================================================================================
SWIPE EVENT HANDLER
====================================================================================================
*/

document.addEventListener('swiped-left', function(e) {
    if (screen.width <= 992) {
        if (sideBar.classList.contains("sidebar-close")) {
            // navContainer.classList.toggle("sidebar-close");
            sideBar.classList.toggle("sidebar-close");
            if (document.querySelector("main .container")) {
                var container = document.querySelector("main .container");
                container.classList.toggle("sidebar-close");
            }
            if (document.querySelector("main .body-container")) {
                var bodyContainer = document.querySelector("main .body-container");
                bodyContainer.classList.toggle("sidebar-close");
            }
        } else {
            if (document.querySelector("main .container")) {
                var container = document.querySelector("main .container");
                container.querySelector(".left").style.width = "20rem";
                container.querySelector(".left .profile").style.display = "flex";
                container.querySelectorAll(".left .sidebar h3").forEach(item => {
                    item.style.display = "block";
                });
            }
            if (document.querySelector("main .body-container")) {
                var bodyContainer = document.querySelector("main .body-container");
                bodyContainer.querySelector(".left").style.width = "20rem";
                bodyContainer.querySelector(".left .profile").style.display = "flex";
                bodyContainer.querySelectorAll(".left .sidebar h3").forEach(item => {
                    item.style.display = "block";
                })
            }
        }
    }
});
document.addEventListener('swiped-right', function(e) {
    if (screen.width <= 992) {
        if (!sideBar.classList.contains("sidebar-close")) {
            // navContainer.classList.toggle("sidebar-close");
            sideBar.classList.toggle("sidebar-close");
            if (document.querySelector("main .container")) {
                var container = document.querySelector("main .container");
                if (container.querySelector(".left").style.width == "20rem") {
                    container.querySelector(".left").style.width = "5rem";
                    container.querySelector(".left .profile").style.display = "none";
                    container.querySelectorAll(".left .sidebar h3").forEach(item => {
                        item.style.display = "none";
                    })
                }
                container.classList.toggle("sidebar-close");
            }
            if (document.querySelector("main .body-container")) {
                var bodyContainer = document.querySelector("main .body-container");
                if (bodyContainer.querySelector(".left").style.width == "20rem") {
                    bodyContainer.querySelector(".left").style.width = "5rem";
                    bodyContainer.querySelector(".left .profile").style.display = "none";
                    bodyContainer.querySelectorAll(".left .sidebar h3").forEach(item => {
                        item.style.display = "none";
                    })
                }
                bodyContainer.classList.toggle("sidebar-close");
            }
        }
    }
});

if (document.querySelector("main .container")) {
    // var navContainer = document.querySelector("nav .container");
    var container = document.querySelector("main .container");

    hideBar.addEventListener("click", () => {
        // navContainer.classList.toggle("sidebar-close");
        container.classList.toggle("sidebar-close");
        sideBar.classList.toggle("sidebar-close");
    });

    document.addEventListener("scroll", (e) => {
        if (!sideBar.classList.contains("sidebar-close")) {
            if (screen.width <= 570) {
                // navContainer.classList.toggle("sidebar-close");
                container.classList.toggle("sidebar-close");
                sideBar.classList.toggle("sidebar-close");
                if (container.querySelector(".left").style.width == "20rem") {
                    container.querySelector(".left").style.width = "5rem";
                    container.querySelector(".left .profile").style.display = "none";
                    container.querySelector(".sidebar h3").style.display = "none"
                }
            }
        }
    })
}

if (document.querySelector("main .body-container")) {
    var bodyContainer = document.querySelector("main .body-container");
    // var navContainer = document.querySelector("nav .container");

    hideBar.addEventListener("click", () => {
        // navContainer.classList.toggle("sidebar-close");
        bodyContainer.classList.toggle("sidebar-close");
        sideBar.classList.toggle("sidebar-close");
    });

    document.addEventListener("scroll", (e) => {
        if (!sideBar.classList.contains("sidebar-close")) {
            if (screen.width <= 701) {
                // navContainer.classList.toggle("sidebar-close");
                bodyContainer.classList.toggle("sidebar-close");
                sideBar.classList.toggle("sidebar-close");
                if (bodyContainer.querySelector(".left").style.width == "20rem") {
                    bodyContainer.querySelector(".left").style.width = "5rem";
                    bodyContainer.querySelector(".left .profile").style.display = "none";
                    bodyContainer.querySelector(".sidebar h3").style.display = "none"
                }
            }
        }
    });
}

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

        // if (item.id != "notifications") {
        //   document.querySelector(".notifications-popup").style.display = "none";
        // } else {
        //   document.querySelector(".notifications-popup").style.display = "block";
        //   document.querySelector(
        //     "#notifications .notification-count"
        //   ).style.display = "none";
        // }
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
            body: JSON.stringify({
                colorTheme
            }),
            headers: {
                "Content-Type": "application/json"
            },
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

    const response = await fetch("/dashboard/private/background",
        {
            method: "POST",
            body: JSON.stringify({
                background
            }),
            headers: {
                "Content-Type": "application/json"
            },
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

    const response = await fetch("/dashboard/private/background",
        {
            method: "POST",
            body: JSON.stringify({
                background
            }),
            headers: {
                "Content-Type": "application/json"
            },
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

    const response = await fetch("/dashboard/private/background",
        {
            method: "POST",
            body: JSON.stringify({
                background
            }),
            headers: {
                "Content-Type": "application/json"
            },
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
            body: JSON.stringify({
                fontSize
            }),
            headers: {
                "Content-Type": "application/json"
            },
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

        middleMessageSearch.addEventListener("keyup",
            middleSearchMessage);
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

        middleMessageSearch.addEventListener("keyup",
            middleSearchMessage);
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
        messageSearch.addEventListener("keyup",
            searchMessage);
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

        middleMessageSearch.addEventListener("keyup",
            middleSearchMessage);
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
    var i,
    postFeeds2,
    tablinks;

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
    var i,
    postFeeds3,
    tablinks;

    postFeeds3 = document.getElementsByClassName("postFeeds3");

    for (i = 0; i < postFeeds3.length; i++) {
        postFeeds3[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks3");

    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}
function openTab4(event, tabName) {
    var i,
    postFeeds4,
    tablinks;

    postFeeds4 = document.getElementsByClassName("postFeeds4");

    for (i = 0; i < postFeeds4.length; i++) {
        postFeeds4[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks4");

    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}
function openTab5(event, tabName) {
    var i,
    postFeeds5,
    tablinks;

    postFeeds5 = document.getElementsByClassName("postFeeds5");

    for (i = 0; i < postFeeds5.length; i++) {
        postFeeds5[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks5");

    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}
function openTab6(event, tabName) {
    var i,
    postFeeds6,
    tablinks;

    postFeeds6 = document.getElementsByClassName("postFeeds6");

    for (i = 0; i < postFeeds6.length; i++) {
        postFeeds6[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks6");

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
        document.querySelector(".selected2 .angle3").style.display = "block";
        document.querySelector(".selected2 .angle4").style.display = "none";
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

        socket.emit("subscribe", {
            userID, channelID
        });
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

        socket.emit("unSubscribe", {
            userID, channelID
        });
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
    socket.emit("removeFromPlaylist", {
        movieID, playlistID
    });

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
        v = c == "x" ? r: (r & 0x3) | 0x8;
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
        checkPostBtn("1234");
        addPostModal.style.display = "grid";
    };

    const closeaddPostModal = (e) => {
        if (e.target.classList.contains("add-post-modal")) {
            var closeModal = false;
            var fields = document.querySelectorAll(".field");

            for (let i = 0; i < fields.length; i++) {
                const element = fields[i];
                if (
                    element.querySelector(".fieldText").value != "" ||
                    element.querySelector(".preview .sub-img") ||
                    element.querySelector(".preview .sub-video")
                ) {
                    closeModal = true;
                }
            }
            if (closeModal) {
                if (confirm("Discard this post?")) {
                    var allFields = document.querySelectorAll(".field");
                    for (let i = 0; i < allFields.length; i++) {
                        const element = allFields[i];

                        if (element.id == "field_1234") {
                            element.querySelector(".fieldText").value = "";
                            if (element.querySelector(".preview .sub-img")) {
                                element
                                .querySelectorAll(".preview .sub-img")
                                .forEach((item) => {
                                    item.remove();
                                });
                            } else if (element.querySelector(".preview .sub-video")) {
                                element.querySelector(".preview .sub-video").remove();
                            }
                        } else {
                            element.remove();
                        }
                    }
                    var charText = document.getElementById("charText");
                    charText.innerText = 300;
                    addPostModal.style.display = "none";
                }
            } else {
                addPostModal.style.display = "none";
            }
        }
    };

    const closeaddPostModalTwo = () => {
        var closeModal = false;
        var fields = document.querySelectorAll(".field");

        for (let i = 0; i < fields.length; i++) {
            const element = fields[i];
            if (
                element.querySelector(".fieldText").value != "" ||
                element.querySelector(".preview .sub-img") ||
                element.querySelector(".preview .sub-video")
            ) {
                closeModal = true;
            }
        }
        if (closeModal) {
            if (confirm("Discard this post?")) {
                var allFields = document.querySelectorAll(".field");
                for (let i = 0; i < allFields.length; i++) {
                    const element = allFields[i];

                    if (element.id == "field_1234") {
                        element.querySelector(".fieldText").value = "";
                        if (element.querySelector(".preview .sub-img")) {
                            element.querySelectorAll(".preview .sub-img").forEach((item) => {
                                item.remove();
                            });
                        } else if (element.querySelector(".preview .sub-video")) {
                            element.querySelector(".preview .sub-video").remove();
                        }
                    } else {
                        element.remove();
                    }
                }
                var charText = document.getElementById("charText");
                charText.innerText = 300;
                addPostModal.style.display = "none";
            }
        } else {
            addPostModal.style.display = "none";
        }
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

let filesObj = {
    fileArray_1234: [],
};
let videoFilesObj = {
    fileArray_1234: [],
};
function submitPost() {
    const addPostModal = document.querySelector(".add-post-modal");
    var valuesArray = [];

    const formData = new FormData();

    var allFields = document.querySelectorAll(".field");
    for (let i = 0; i < allFields.length; i++) {
        const element = allFields[i];

        var textValue = element.querySelector(".fieldText").value;
        var theID = element.id.split("_")[1];

        var fileKeyArray = [];
        var fieldObj;
        var abc = "fileArray_" + theID;
        if (element.querySelector(".preview .sub-img")) {
            for (let key = 0; key < filesObj[abc].length; key++) {
                fileKeyArray.push(filesObj[abc][key].id);
                formData.append(filesObj[abc][key].id, filesObj[abc][key].file);
            }
            fieldObj = {
                textValue,
                files: fileKeyArray,
            };
        } else if (element.querySelector(".preview .sub-video")) {
            fileKeyArray.push(videoFilesObj[abc][0].id);
            formData.append(videoFilesObj[abc][0].id, videoFilesObj[abc][0].file);
            // for (let key = 0; key < videoFilesObj[abc].length; key++) {
            // }
            fieldObj = {
                textValue,
                files: fileKeyArray,
            };
        } else {
            fieldObj = {
                textValue,
                files: fileKeyArray,
            };
        }

        valuesArray.push(fieldObj);
    }
    let commentators = document.querySelector(".selected").innerText;
    let viewers = document.querySelector(".selected2").innerText;

    var allFields = document.querySelectorAll(".field");
    for (let i = 0; i < allFields.length; i++) {
        const element = allFields[i];

        if (element.id == "field_1234") {
            element.querySelector(".fieldText").value = "";
            if (element.querySelector(".preview .sub-img")) {
                element.querySelectorAll(".preview .sub-img").forEach((item) => {
                    item.remove();
                });
            } else if (element.querySelector(".preview .sub-video")) {
                element.querySelector(".preview .sub-video").remove();
            }
        } else {
            element.remove();
        }
    }
    var charText = document.getElementById("charText");
    charText.innerText = 300;
    addPostModal.style.display = "none";

    infoAlert.style.display = "block";
    infoMessage.textContent = "Processing your post, please wait!";

    formData.append("whoCanComment", commentators);
    formData.append("whoCanSee", viewers);
    formData.append("poster", theUserID);
    formData.append("altText", "");
    formData.append("qoutedPost", "");
    formData.append("commentedPost", "");
    formData.append("posts", JSON.stringify(valuesArray));

    fetch("/dashboard/public/addPost", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.bigFile) {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = "File size is too big";

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        } else if (json.success) {
            infoAlert.style.display = "none";

            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = "Your post has been sent";

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}
function savePost(obj) {
    const addPostModal = document.querySelector(".add-post-modal");
    var valuesArray = [];

    const formData = new FormData();

    var allFields = document.querySelectorAll(".field");
    for (let i = 0; i < allFields.length; i++) {
        const element = allFields[i];

        var textValue = element.querySelector(".fieldText").value;
        var theID = element.id.split("_")[1];

        var fileKeyArray = [];
        var fieldObj;
        var abc = "fileArray_" + theID;
        if (element.querySelector(".preview .sub-img")) {
            for (let key = 0; key < filesObj[abc].length; key++) {
                fileKeyArray.push(filesObj[abc][key].id);
                formData.append(filesObj[abc][key].id, filesObj[abc][key].file);
            }
            fieldObj = {
                textValue,
                files: fileKeyArray,
            };
        } else if (element.querySelector(".preview .sub-video")) {
            fileKeyArray.push(videoFilesObj[abc][0].id);
            formData.append(videoFilesObj[abc][0].id, videoFilesObj[abc][0].file);
            // for (let key = 0; key < videoFilesObj[abc].length; key++) {
            // }
            fieldObj = {
                textValue,
                files: fileKeyArray,
            };
        } else {
            fieldObj = {
                textValue,
                files: fileKeyArray,
            };
        }

        valuesArray.push(fieldObj);
    }
    let commentators = document.querySelector(".selected").innerText;
    let viewers = document.querySelector(".selected2").innerText;

    var allFields = document.querySelectorAll(".field");
    for (let i = 0; i < allFields.length; i++) {
        const element = allFields[i];

        if (element.id == "field_1234") {
            element.querySelector(".fieldText").value = "";
            if (element.querySelector(".preview .sub-img")) {
                element.querySelectorAll(".preview .sub-img").forEach((item) => {
                    item.remove();
                });
            } else if (element.querySelector(".preview .sub-video")) {
                element.querySelector(".preview .sub-video").remove();
            }
        } else {
            element.remove();
        }
    }
    var charText = document.getElementById("charText");
    charText.innerText = 300;
    addPostModal.style.display = "none";

    infoAlert.style.display = "block";
    infoMessage.textContent = "Saving your post, please wait!";

    formData.append("whoCanComment", commentators);
    formData.append("whoCanSee", viewers);
    formData.append("poster", theUserID);
    formData.append("altText", "");
    formData.append("qoutedPost", "");
    formData.append("commentedPost", "");
    formData.append("posts", JSON.stringify(valuesArray));

    fetch("/dashboard/public/savePost", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.bigFile) {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = "File size is too big";

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        } else if (json.success) {
            infoAlert.style.display = "none";

            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fas fa-save";
            successMessage.textContent = "Your post has been saved";

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}

function addThread(id) {
    document.getElementById("post-btn").disabled = true;
    document.getElementById("post-btn").classList.remove("btn-primary");

    var charLength = document.getElementById("post-msg-" + id).value.length;
    var charText = document.getElementById("charText");
    charText.innerText = 300;

    var notActives = document.querySelectorAll(".not-active");
    var fields = document.querySelectorAll(".field");

    for (let i = 0; i < notActives.length; i++) {
        notActives[i].style.display = "block";
    }

    let randID = Math.floor(Math.random() * 999999) + 1;
    let abc = "fileArray_" + randID;

    for (let i = 0; i < fields.length; i++) {
        fields[i].style.opacity = "0.3";

        if (fields[i].id == "field_" + randID) {
            fields[i].style.opacity = "1";
        }
    }

    filesObj[abc] = [];
    videoFilesObj[abc] = [];

    var div = document.createElement("div");
    div.className = "field";
    div.id = "field_" + randID;
    div.innerHTML = `
    <div class="one">
    <img src="../../../uploads/${userAvatar}" alt="">
    <textarea class="fieldText" id="post-msg-${randID}" oninput="countChars('${randID}')" placeholder="What's on your mind?"></textarea>
    </div>
    <div class="preview"></div>
    <div class="not-active" onclick="makeActive(this,'${randID}')"></div>
    <span class="remove" title="Remove Thread" onclick="removeThread('${randID}')"><i class="fa fa-times"></i></span>
    `;

    // var postForm = document.querySelector(".post-form #field_" + id)
    var postForm = document.querySelector(".post-form .theFields");

    if (!document.querySelector("#field_" + randID)) postForm.append(div);

    checkPostBtn(randID);
    document.getElementById("post-msg-" + randID).focus();
    var selectImg = document.querySelector(".selectImg");
    var selectVideo = document.querySelector(".selectVideo");
    var addThreadBtn = document.querySelector("#add-thread");

    selectImg.setAttribute("onclick", "createImg('" + randID + "')");
    selectVideo.setAttribute("onclick", "createVideo('" + randID + "')");
    addThreadBtn.setAttribute("onclick", "addThread('" + randID + "')");
}

function removeThread(id) {
    var fields = document.querySelectorAll(".field");
    var position;
    var idArray = [];

    for (let i = 0; i < fields.length; i++) {
        idArray.push(fields[i].id);
        if (fields[i].id == "field_" + id) {
            position = idArray.indexOf(fields[i].id);
        }
    }

    var newFocus = position - 1;
    var newID = fields[newFocus].id.split("_")[1];

    document.querySelector(
        "#" + fields[newFocus].id + " .not-active"
    ).style.display = "none";

    for (let i = 0; i < fields.length; i++) {
        fields[i].style.opacity = "0.3";

        if (fields[i].id == "field_" + newID) {
            fields[i].style.opacity = "1";
        }
    }

    var charLength = document.getElementById("post-msg-" + newID).value.length;
    document.getElementById("post-msg-" + newID).focus();
    var charText = document.getElementById("charText");
    charText.innerText = 300 - charLength;

    var selectImg = document.querySelector(".selectImg");
    var selectVideo = document.querySelector(".selectVideo");
    var addThreadBtn = document.querySelector("#add-thread");

    selectImg.setAttribute("onclick", "createImg('" + newID + "')");
    selectVideo.setAttribute("onclick", "createVideo('" + newID + "')");
    addThreadBtn.setAttribute("onclick", "addThread('" + newID + "')");

    document.getElementById("field_" + id).remove();
    checkPostBtn(id);
}

function makeActive(obj, id) {
    checkPostBtn(id);

    var notActives = document.querySelectorAll(".not-active");
    var fields = document.querySelectorAll(".field");

    for (let i = 0; i < fields.length; i++) {
        fields[i].style.opacity = "0.3";

        if (fields[i].id == "field_" + id) {
            fields[i].style.opacity = "1";
        }
    }

    for (let i = 0; i < notActives.length; i++) {
        notActives[i].style.display = "block";
    }

    obj.style.display = "none";

    var charLength = document.getElementById("post-msg-" + id).value.length;
    var charText = document.getElementById("charText");
    charText.innerText = 300 - charLength;

    var selectImg = document.querySelector(".selectImg");
    var selectVideo = document.querySelector(".selectVideo");
    var addThreadBtn = document.querySelector("#add-thread");

    selectImg.setAttribute("onclick", "createImg('" + id + "')");
    selectVideo.setAttribute("onclick", "createVideo('" + id + "')");
    addThreadBtn.setAttribute("onclick", "addThread('" + id + "')");
}

function countChars(id) {
    var charLength = document.getElementById("post-msg-" + id).value.length;
    var charText = document.getElementById("charText");
    charText.innerText = 300 - charLength;

    var postBtn = document.getElementById("post-btn");
    var postBtnSave = document.getElementById("post-btn-save");
    var addThreadBtn = document.getElementById("add-thread");
    var draftBtn = document.getElementById("draft-btn");

    var fieldID = document.getElementById("field_" + id);

    if (charLength > 300) {
        if (id != "1234") {
            fieldID.querySelector(".remove").style.display = "flex";
        }

        postBtnSave.style.display = "none";
        postBtnSave.disabled;
        postBtnSave.style.backgroundColor = "var(--color-light)";
        postBtnSave.style.color = "var(--color-gray)";

        draftBtn.style.display = "block";

        postBtn.disabled;
        postBtn.classList.remove("btn-primary");

        addThreadBtn.style.display = "none";
        addThreadBtn.disabled;
        addThreadBtn.style.backgroundColor = "var(--color-light)";
        addThreadBtn.style.color = "var(--color-gray)";
    } else {
        if (id != "1234") {
            fieldID.querySelector(".remove").style.display = "none";
        }

        postBtnSave.style.display = "block";
        postBtnSave.disabled = false;
        postBtnSave.style.backgroundColor = "var(--color-gray)";
        postBtnSave.style.color = "black";

        draftBtn.style.display = "none";

        addThreadBtn.style.display = "block";
        addThreadBtn.disabled = false;
        addThreadBtn.style.backgroundColor = "var(--color-gray)";
        addThreadBtn.style.color = "black";

        postBtn.disabled = false;
        if (!postBtn.classList.contains("btn-primary"))
            postBtn.classList.add("btn-primary");
    }

    checkPostBtn(id);
}

function createImg(id) {
    var field = document.getElementById("field_" + id);

    if (field.querySelectorAll(".preview .sub-img")) {
        var imgNo = field.querySelectorAll(".preview .sub-img").length;
    } else {
        var imgNo = 0;
    }

    if (field.querySelector(".preview .sub-video")) {
        // Can't select more than a video
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "Can't select a video with images";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    } else if (imgNo > 4) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "Can't select more than four images";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    } else {
        var remainder = 4 - imgNo;
        let randID = Math.random() * 10;

        var img = document.createElement("input");
        img.setAttribute("type", "file");
        img.setAttribute("onchange", "showImg(this, " + id + ")");
        img.className = remainder;
        img.setAttribute("style", "display: none;");
        img.accept = "image/*";
        img.id = randID;
        img.multiple = true;

        field.appendChild(img);
        // field.querySelector(".preview").appendChild(div)

        var image = document.getElementById(randID);

        image.click();
    }
}

function showImg(image, fieldID) {
    var abc = "fileArray_" + fieldID;

    var charLength = document.getElementById("post-msg-" + fieldID).value.length;
    var charText = document.getElementById("charText");
    charText.innerText = 300 - charLength;

    // var id = image.id;
    var remainder = parseInt(image.className);
    if (image.files.length > 0 && image.files.length <= remainder) {
        var field = document.getElementById("field_" + fieldID);

        for (let i = 0; i < image.files.length; i++) {
            let randID = Math.random() * 10;
            var div = document.createElement("div");
            div.className = "sub-img";
            div.setAttribute("style", "display: none;");
            div.id = "imgPreview_" + randID;
            div.innerHTML = `
            <span onclick="removeImg('${randID}', '${fieldID}')"><i class="fa fa-times"></i></span>
            <img src="" alt="">
            `;

            if (image.files[i].size > 7000000) {
                dangerAlert.style.display = "block";
                dangerMessage.textContent = "File size too big";

                setTimeout(() => {
                    dangerAlert.style.display = "none";
                }, 5000);
            } else {
                var obj = {
                    id: randID,
                    file: image.files[i],
                };

                filesObj[abc].push(obj);

                field.querySelector(".preview").appendChild(div);

                var src = URL.createObjectURL(image.files[i]);
                var preview = document.getElementById("imgPreview_" + randID);
                preview.style.display = "block";
                preview.querySelector("img").src = src;
            }
        }

        checkPostBtn(fieldID);

        //Delete the input type file
        // document.getElementById(id).remove()
    } else {
        if (image.files.length < 1) {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = "You didn't select any image file";

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        } else {
            //Can't select more than 2
            dangerAlert.style.display = "block";
            dangerMessage.textContent = "You can't select more than four images";

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    }
}

function removeImg(id, inputID) {
    var abc = "fileArray_" + inputID;

    for (var i = 0; i < filesObj[abc].length; i++) {
        if (filesObj[abc][i].id.toString() === id) {
            filesObj[abc].splice(i, 1);
        }
    }

    document.getElementById("imgPreview_" + id).remove();
    checkPostBtn(inputID);
}

function createVideo(id) {
    var field = document.getElementById("field_" + id);
    if (field.querySelector(".preview .sub-img")) {
        // Can't select a video with images
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "Can't select a video with images";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    } else if (field.querySelector(".preview .sub-video")) {
        // var imgNo = field.querySelectorAll(".preview .sub-img").length;
        // Can't select more than a video
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "Can't select more than a video";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    } else {
        // var remainder = 4 - imgNo;
        let randID = Math.random() * 10;

        var video = document.createElement("input");
        video.setAttribute("type", "file");
        video.setAttribute("onchange", "showVideo(this, " + id + ")");
        // video.className = remainder;
        video.setAttribute("style", "display: none;");
        video.accept = "video/*";
        video.id = randID;

        field.appendChild(video);
        // field.querySelector(".preview").appendChild(div)

        var videoInput = document.getElementById(randID);

        videoInput.click();
    }
}

function showVideo(video, fieldID) {
    var abc = "fileArray_" + fieldID;
    var charLength = document.getElementById("post-msg-" + fieldID).value.length;
    var charText = document.getElementById("charText");
    charText.innerText = 300 - charLength;

    var id = video.id;
    // var remainder = parseInt(video.className);
    if (video.files.length > 0) {
        var field = document.getElementById("field_" + fieldID);

        // for (let i = 0; i < video.files.length; i++) {
        let randID = Math.random() * 10;
        var div = document.createElement("div");
        div.className = "sub-video";
        div.setAttribute("style", "display: none;");
        div.id = "videoPreview_" + randID;
        div.innerHTML = `
        <span onclick="removeVideo('${randID}', '${fieldID}')"><i class="fa fa-times"></i></span>
        <video src="" controls></video>
        `;

        if (video.files[0].size > 20000000) {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = "Video file size too big";

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        } else {
            field.querySelector(".preview").appendChild(div);

            // var duration;
            var src = URL.createObjectURL(video.files[0]);
            var preview = document.getElementById("videoPreview_" + randID);
            preview.style.display = "block";
            preview.querySelector("video").src = src;

            var obj = {
                id: randID,
                file: video.files[0],
            };

            videoFilesObj[abc].push(obj);
            // vid.preload = "metadata";
            // vid.onloadedmetadata = function () {
            //   return vid.duration;
            //   console.log(vid.duration);
            // };
        }
        // }

        checkPostBtn(fieldID);

        //Delete the input type file
        document.getElementById(id).remove();
    } else {
        //Can't select more than 4
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "No video file has been selected";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    }
}
function removeVideo(id, inputID) {
    var abc = "fileArray_" + inputID;

    for (var i = 0; i < videoFilesObj[abc].length; i++) {
        if (videoFilesObj[abc][i].id.toString() === id) {
            videoFilesObj[abc].splice(i, 1);
        }
    }

    document.getElementById("videoPreview_" + id).remove();
    checkPostBtn(inputID);
}

socket.on("draftsFetched", (drafts) => {
    displayDrafts(drafts);
});

function displayDrafts(drafts) {
    var existingDraft = [];
    drafts.forEach((draft) => {
        if (!existingDraft.includes(draft.threadID)) {
            existingDraft.push(draft.threadID);
            var div = document.createElement("div");
            div.className = "menu";
            div.id = draft.threadID;
            div.setAttribute("onclick", `displayTheDraft('${draft.threadID}')`);

            div.innerHTML = `
            ${draft.files.length < 1
            ? `
            <div class="text">
            ${draft.postText}
            </div>
            `: draft.files[0].filePath.split("/")[4] == "image"
            ? `
            <div class="img-media">
            <img src="${draft.files[0].filePath}" alt="">
            </div>
            <div class="text">
            ${draft.postText}
            </div>
            `: `
            <div class="video-media">
            <span class="play-icon"><i class="fa fa-play"></i></span>
            <video src="${draft.files[0].filePath}"></video>
            </div>
            <div class="text">
            ${draft.postText}
            </div>
            `
            }
            `;

            if (
                !document.querySelector(".drafts-modal .card .menus #" + draft.threadID)
            )
                document.querySelector(".drafts-modal .card .menus").appendChild(div);
        }
    });
}

function showDrafts(userID) {
    socket.emit("showDrafts",
        userID);

    const draftsModal = document.querySelector(".drafts-modal");
    const addPostModal = document.querySelector(".add-post-modal");

    draftsModal.style.display = "grid";
    addPostModal.style.display = "none";
}

function closeDrafts() {
    const draftsModal = document.querySelector(".drafts-modal");
    const addPostModal = document.querySelector(".add-post-modal");

    draftsModal.style.display = "none";
    addPostModal.style.display = "grid";
}

socket.on("displayDraft", (draft) => {
    insertDraft(draft);
});

function insertDraft(draft) {
    const draftsModal = document.querySelector(".drafts-modal");
    const addPostModal = document.querySelector(".add-post-modal");
    for (let i = 0; i < draft.length; i++) {
        var element = draft[i];

        if (element == draft[0]) {
            document.getElementById("post-msg-1234").innerText = element.postText;

            if (
                element.files.length > 0 &&
                element.files[0].filePath.split("/")[4] == "image"
            ) {
                element.files.forEach((file) => {
                    let randID = Math.floor(Math.random() * 999999) + 1;
                    var div = document.createElement("div");
                    div.className = "sub-img";
                    div.id = "imgPreview_" + randID;
                    div.innerHTML = `
                    <span onclick="removeImg('${randID}', '1234')"><i class="fa fa-times"></i></span>
                    <img src="${file.filePath}" alt="">
                    `;
                    if (
                        !document.querySelector(
                            "#field_1234 .preview #imgPreview_" + randID
                        )
                    )
                        document.querySelector("#field_1234 .preview").appendChild(div);
                });
            } else if (
                element.files.length > 0 &&
                element.files[0].filePath.split("/")[4] == "video"
            ) {
                let randID = Math.floor(Math.random() * 999999) + 1;
                var div = document.createElement("div");
                div.className = "sub-video";
                div.id = "videoPreview_" + randID;
                div.innerHTML = `
                <span onclick="removeVideo('${randID}', '1234')"><i class="fa fa-times"></i></span>
                <video src="${element.files[0].filePath}" controls></video>
                `;
                if (
                    !document.querySelector(
                        "#field_1234 .preview #videoPreview_" + randID
                    )
                )
                    document.querySelector("#field_1234 .preview").appendChild(div);
            }
        } else {
            let randID = Math.floor(Math.random() * 999999) + 1;

            var div = document.createElement("div");
            div.className = "field";
            div.id = "field_" + randID;
            div.innerHTML = `
            <div class="one">
            <img src="../../../uploads/${userAvatar}" alt="">
            <textarea class="fieldText" id="post-msg-${randID}" oninput="countChars('${randID}')" placeholder="What's on your mind?">${element.postText}</textarea>
            </div>
            <div class="preview"></div>
            <div class="not-active" onclick="makeActive(this,'${randID}')"></div>
            <span class="remove" title="Remove Thread" onclick="removeThread('${randID}')"><i class="fa fa-times"></i></span>
            `;

            if (!document.querySelector(".theFields #field_" + randID))
                document.querySelector(".theFields").appendChild(div);

            if (
                element.files.length > 0 &&
                element.files[0].filePath.split("/")[4] == "image"
            ) {
                element.files.forEach((file) => {
                    let imgRandID = Math.floor(Math.random() * 999999) + 1;
                    var div = document.createElement("div");
                    div.className = "sub-img";
                    div.id = "imgPreview_" + imgRandID;
                    div.innerHTML = `
                    <span onclick="removeImg('${imgRandID}', '${randID}')"><i class="fa fa-times"></i></span>
                    <img src="${file.filePath}" alt="">
                    `;
                    if (
                        !document.querySelector(
                            "#field_" + randID + " .preview #imgPreview_" + imgRandID
                        )
                    )
                        document
                    .querySelector("#field_" + randID + " .preview")
                    .appendChild(div);
                });
            } else if (
                element.files.length > 0 &&
                element.files[0].filePath.split("/")[4] == "video"
            ) {
                let videoRandID = Math.floor(Math.random() * 999999) + 1;
                var div = document.createElement("div");
                div.className = "sub-video";
                div.id = "videoPreview_" + videoRandID;
                div.innerHTML = `
                <span onclick="removeVideo('${videoRandID}', '${randID}')"><i class="fa fa-times"></i></span>
                <video src="${element.files[0].filePath}" controls></video>
                `;
                if (
                    !document.querySelector(
                        "#field_" + randID + " .preview #videoPreview_" + videoRandID
                    )
                )
                    document
                .querySelector("#field_" + randID + " .preview")
                .appendChild(div);
            }
        }
    }
    var notActives = document.querySelectorAll(".not-active");
    var fields = document.querySelectorAll(".field");

    for (let i = 0; i < fields.length; i++) {
        fields[i].style.opacity = "0.3";

        if (fields[i].id == "field_1234") {
            fields[i].style.opacity = "1";
        }
    }

    for (let i = 0; i < notActives.length; i++) {
        notActives[i].style.display = "block";
        if (notActives[i] == notActives[0]) notActives[i].style.display = "none";
    }
    draftsModal.style.display = "none";
    addPostModal.style.display = "grid";
    checkPostBtn("1234");
}

// ========================CALCULATION DISTANCE BETWEEN TWO MATES==================== //

//Initiate a function to get user's location
// getUserLocation()
// calcMateDistance();
var calcDistance = calcMateDistance(
    "myLatitude",
    "myLongitude",
    "mateLastSeenLatitude",
    "mateLastSeenLongitude",
    "K"
);
// console.log(Math.round(calcDistance * 1000) / 1000);

const options = {
    enableHighAccuracy: true,
    timeout: 10000,
};

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            showPosition,
            showErrorGettingPosition,
            options
        );
    } else {
        //Give error message that "Geolocation is not supported by this browser!"
    }
}

function showPosition(position) {
    // var message =
    //   "Latitude: " +
    //   position.coords.latitude +
    //   " & Longitude: " +
    //   "Latitude: " +
    //   position.coords.longitude;
    socket.emit(
        "getUserLocation",
        position.coords.latitude,
        position.coords.longitude
    );
}

function showErrorGettingPosition(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            var message = "User denied the request for Geolocation";
            break;
        case error.POSITION_UNAVAILABLE:
            var message = "Location information is unavailable";
            break;
        case error.TIMEOUT:
            var message = "The request to get user location timed out";
            break;
        case error.UNKNOWN_ERROR:
            var message = "An unknown error occured.";
            break;

        default:
            break;
    }
}

function calcMateDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var radlon1 = (Math.PI * lon1) / 180;
    var radlon2 = (Math.PI * lon2) / 180;

    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;

    var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit == "K") {
        dist = dist * 1.609344;
    }

    if (unit == "N") {
        dist = dist * 0.8684;
    }

    return dist;
}

function toggleSettingsChild(obj) {
    var settingsPanel = document.getElementsByClassName("settings-child");
    var child = document.querySelector(".settings-child." + obj);

    for (let i = 0; i < settingsPanel.length; i++) {
        if (!settingsPanel[i].classList.contains(obj)) {
            settingsPanel[i].style.display = "none";
        }
    }
    if (child.style.display == "flex") {
        child.style.display = "none";
    } else {
        child.style.display = "flex";
    }
}

function toggleSettings() {
    if (
        document.querySelector(".forum-profile .settings").style.display == "none"
    ) {
        document.querySelector(".forum-profile .settings").style.display = "flex";
        if (document.querySelector(".forum-profile .forum-body")) {
            document.querySelector(".forum-profile .forum-body").style.display = "none";
            document.querySelector(".forum-profile .body-forum").style.display = "none";
        }
    } else {
        document.querySelector(".forum-profile .settings").style.display = "none";
        if (document.querySelector(".forum-profile .forum-body")) {
            document.querySelector(".forum-profile .forum-body").style.display = "flex";
            document.querySelector(".forum-profile .body-forum").style.display = "flex";
        }
    }
}

function toggleSettingsTwo() {
    if (
        document.querySelector(".forum-profile .settings").style.display == "none"
    ) {
        document.querySelector(".forum-profile .settings").style.display = "flex";
    } else {
        document.querySelector(".forum-profile .settings").style.display = "none";
    }
}

function editRank(rank, forumID) {
    var upvote = document.querySelector(".upvote-" + rank);
    var inputValue = document.querySelector(".upvote-" + rank).value;

    if (upvote.disabled == true) {
        upvote.disabled = false;
    } else {
        updateForumRanks(forumID, rank, inputValue);
        document.querySelector(".upvote-" + rank).disabled = true;
    }
}

function closeCreateForum() {
    document.querySelector(".create-forum .image-preview").style.display = "none";
    document.getElementById("forumName").value = "";
    document.getElementById("forumDesc").value = "";

    document.querySelector(".create-forum").style.display = "none";
}

function showCreateForum() {
    if (document.querySelector(".create-forum").style.display == "none") {
        document.querySelector(".create-forum").style.display = "flex";
    } else {
        document.querySelector(".create-forum .image-preview").style.display =
        "none";
        document.getElementById("forumName").value = "";
        document.getElementById("forumDesc").value = "";

        document.querySelector(".create-forum").style.display = "none";
    }
}

function showPreview2(event) {
    if (event.target.files.length > 0) {
        var src = URL.createObjectURL(event.target.files[0]);
        var preview = document.getElementById("img-preview");
        preview.src = src;
        document.querySelector(".image-preview").style.display = "flex";
        document.querySelector(".image-preview .pic").style.display = "block";
    }
}

function showPreview3(event) {
    if (event.target.files.length > 0) {
        var src = URL.createObjectURL(event.target.files[0]);
        var preview = document.getElementById("img-preview2");
        preview.src = src;
        document.querySelector(".image-preview").style.display = "flex";
        document.querySelector(".image-preview .pic").style.display = "block";
    }
}
function showPreview4(event) {
    if (event.target.files.length > 0) {
        var src = URL.createObjectURL(event.target.files[0]);
        var preview = document.getElementById("img-preview3");
        preview.src = src;
        document.querySelector("#showForumDP").style.display = "flex";
        document.querySelector("#showForumDP .pic").style.display = "block";
    }
}

function updateForumDisplayPic() {
    const formData = new FormData();
    formData.append("displayPic", document.getElementById("logo").files[0]);
    formData.append("forumID", document.getElementById("forumIDForUpload").value);

    document.querySelector("#showForumDP").style.display = "none";

    primaryAlert.style.display = "block";
    primaryMessage.textContent = "Updating forum display picture, please wait...";

    fetch("/dashboard/public/updateForumDisplayPic", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            const forumInfo = json.forumInfo;
            var displayPic = forumInfo.displayPic;
            document.getElementById("forum-avatar").src = displayPic;

            primaryAlert.style.display = "none";
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 5000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        primaryAlert.style.display = "none";
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "An error occured. Please try again later";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    });
}

function createForum() {
    const formData = new FormData();
    formData.append(
        "displayPic",
        document.getElementById("display-pic").files[0]
    );
    formData.append("forumName",
        document.getElementById("forumName").value);
    formData.append("forumDesc",
        document.getElementById("forumDesc").value);

    document.querySelector(".image-preview").style.display = "none";
    document.getElementById("forumName").value = "";
    document.getElementById("forumDesc").value = "";

    primaryAlert.style.display = "block";
    primaryMessage.textContent = "Creating your forum, please wait...";

    fetch("/dashboard/public/createForum",
        {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
        })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            primaryAlert.style.display = "none";
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
                const forumInfo = json.forumInfo;
                location.assign("/dashboard/public/forum/" + forumInfo._id);
            }, 5000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        primaryAlert.style.display = "none";
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "An error occured. Please try again later";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    });
}

function goToNewPage(requestedPage, incomingTotalPages, forumID) {
    socket.emit("getNewPageTopics",
        {
            requestedPage,
            incomingTotalPages,
            forumID,
        });
}

socket.on(
    "newTopics",
    (newTopics, page, totalPages, nextPage, previousPage) => {
        loadTopicsPage(newTopics, page, totalPages, nextPage, previousPage);
    }
);

function loadTopicsPage(newTopics, page, totalPages, nextPage, previousPage) {
    //Remove all previous topics
    document.querySelectorAll("#forumTopics .topic").forEach((item) => {
        item.remove();
    });
    //Loop through each new topics and append them
    newTopics.forEach((topic) => {
        var a = document.createElement("div");
        a.classList.add("topic");
        a.innerHTML =
        `
        <div class="topic-left">
        <p><span class="fa fa-eye"></span> ${topic.topic.__v}
        View${topic.topic.__v > 1 ? "s": ""}</p>
        <p><span class="fa fa-comment"></span> ${topic.topic.responses.length
        }
        Comment${topic.topic.responses.length > 1 ? "s": ""}</p>
        <p><span class="fa-solid fa-up-long"></span> ${topic.topic.upvotes
        }
        Upvote${topic.topic.upvotes > 1 ? "s": ""}</p>
        </div>
        <div class="topic-middle">
        <a href="/dashboard/public/forum/${forumID}/key?topicID=${topic.topic._id
        }">
        <h4>${topic.topic.subject.length > 100
        ? topic.topic.subject.substr(0, 100) + "...": topic.topic.subject
        }</h4>
        </a>
        <div class="tags" id="topicTags_${topic.topic._id}">` +
        topic.topic.topicTags
        .map((tag) => {
            return `<a href="/dashboard/public/forum_topic_categories/${tag}/key?forumID=${forumID}">
            <div>
            <span class="fa fa-tag"></span>
            ${tag}
            </div>
            </a>`;
        })
        .join("") +
        `</div>
        </div>
        <div class="topic-right">
        <div class="user-info">
        <a href="/dashboard/public/member_profile/${forumID}/key?memberID=${topic.userInfo._id
        }">
        <div class="profile-pic">
        <img src="../../../../uploads/${topic.userInfo.avatar
        }" alt="">
        </div>
        </a>
        <h5><a href="/dashboard/public/member_profile/${forumID}/key?memberID=${topic.userInfo._id
        }">${topic.userInfo.username}</a> <span
        class="text-muted">${topic.memberUpvotes} upvote
        ${topic.memberUpvotes > 1 ? "s": ""},
        ${new Date(
            topic.topic.createdAt
        ).toDateString()}</span>
        </h5>
        </div>
        </div>
        `;
        document.getElementById("forumTopics").appendChild(a);
    });
    var div = document.createElement("div");
    div.classList.add("pagination");
    div.innerHTML = ``;
    if (page == 1) {
        for (let i = 1; i < 4; i++) {
            div.innerHTML += `
            <div onclick="goToNewPage('${i}','${totalPages}','${forumID}')" class=${i == page ? "active": ""
            }>${i}</div>
            `;
        }
        if (totalPages > 3) {
            div.innerHTML += `
            <div style="cursor: auto;">...</div>
            <div onclick="goToNewPage('${totalPages}','${totalPages}','${forumID}')">${totalPages}</div>
            `;
        }
        div.innerHTML += `
        <div class="next" onclick="goToNewPage('${nextPage}','${totalPages}','${forumID}')">
        <span>Next</span><i class="fa-solid fa-angle-right"></i></div>
        `;
    } else if (page == totalPages) {
        if (totalPages > 3) {
            div.innerHTML += `
            <div class="previous" onclick="goToNewPage('${previousPage}','${totalPages}','${forumID}')"><i class="fa-solid fa-angle-left"></i><span>Previous</span></div>
            `;
            div.innerHTML += `
            <div onclick="goToNewPage('1','${totalPages}','${forumID}')">1</div>
            <div style="cursor: auto;">...</div>
            `;
            for (let i = totalPages - 2; i < totalPages + 1; i++) {
                div.innerHTML += `
                <div onclick="goToNewPage('${i}','${totalPages}','${forumID}')" class=${i == page ? "active": ""
                }>${i}</div>
                `;
            }
        }
        if (totalPages <= 3) {
            for (let i = 1; i < 4; i++) {
                div.innerHTML += `
                <div onclick="goToNewPage('${i}','${totalPages}','${forumID}')" class=${i == page ? "active": ""
                }>${i}</div>
                `;
            }
            if (page < 3) {
                div.innerHTML += `
                <div class="next" onclick="goToNewPage('${nextPage}','${totalPages}','${forumID}')">
                <span>Next</span><i class="fa-solid fa-angle-right"></i></div>`;
            }
        }
    } else {
        div.innerHTML += `
        <div class="previous" onclick="goToNewPage('${previousPage}','${totalPages}','${forumID}')"><i class="fa-solid fa-angle-left"></i><span>Previous</span></div>
        `;
        if (page <= 3) {
            for (let i = 1; i < 4; i++) {
                div.innerHTML += `
                <div onclick="goToNewPage('${i}','${totalPages}','${forumID}')" class=
                ${i == page ? "active": ""}>${i}</div>
                `;
            }

            if (totalPages > 3) {
                div.innerHTML += `
                <div style="cursor: auto;">...</div>
                <div onclick="goToNewPage('${totalPages}','${totalPages}','${forumID}')">${totalPages}</div>`;
            }

            div.innerHTML += `
            <div class="next" onclick="goToNewPage('${nextPage}','${totalPages}','${forumID}')">
            <span>Next</span><i class="fa-solid fa-angle-right"></i></div>
            `;
        }
        if (page > 3) {
            div.innerHTML += `
            <div onclick="goToNewPage('1','${totalPages}','${forumID}')">1</div>
            <div style="cursor: auto;">...</div>
            `;
            if (totalPages >= page + 2) {
                for (let i = page; i < page + 3; i++) {
                    div.innerHTML += `
                    <div onclick="goToNewPage('${i}','${totalPages}','${forumID}')" class=${i == page ? "active": ""
                    }>${i}</div>
                    `;
                }
                if (totalPages > page + 2) {
                    div.innerHTML += `
                    <div style="cursor: auto;">...</div>
                    <div onclick="goToNewPage('${totalPages}','${totalPages}','${forumID}')">${totalPages}</div>
                    <div class="next" onclick="goToNewPage('${nextPage}','${totalPages}','${forumID}')">
                    <span>Next</span><i class="fa-solid fa-angle-right"></i></div>
                    `;
                }
            } else {
                for (let i = page; i < totalPages + 1; i++) {
                    div.innerHTML += `
                    <div onclick="goToNewPage('${i}','${totalPages}','${forumID}')" class=${i == page ? "active": ""
                    }>${i}</div>
                    `;
                }
            }
        }
    }
    document.querySelector("#forumTopics .pagination").remove();
    document.querySelector("#forumTopics").appendChild(div);
}

function fetchAForumInfo(forumID, userID) {
    socket.emit("fetchAForumInfo", {
        forumID, userID
    });
    primaryAlert.style.display = "block";
    primaryMessage.textContent = "Loading...";
}

socket.on(
    "aForumInfo",
    (
        forumInfo,
        forumRanks,
        incomingInvites,
        forumMembers,
        creatorDetails,
        numberOfPosts
    ) => {
        loadAForumInfo(
            forumInfo,
            forumRanks,
            incomingInvites,
            forumMembers,
            creatorDetails,
            numberOfPosts
        );
    }
);

function loadAForumInfo(
    forumInfo,
    forumRanks,
    incomingInvites,
    forumMembers,
    creatorDetails,
    numberOfPosts
) {
    // ==================FETCH FORUM INFO===================== //
    var forumHeader = document.querySelector(".forum-profile .forum-header");

    // =================== INSERT VARIABLES TO TOPIC SUBMISSION BUTTON =========== //
    var theArray = JSON.stringify(forumInfo.wordsFilter);
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-primary");
    button.type = "submit";
    button.setAttribute(
        "onclick",
        "submitForumTopic('" + forumInfo._id + "', '" + theArray + "')"
    );
    button.innerHTML = `<i class="fa-solid fa-paper-plane"></i><span>Send</span>`;
    if (document.querySelector(".add-topic-modal .actions"))
        document.querySelector(".add-topic-modal .actions").appendChild(button);
    // =================== INSERT VARIABLES TO TOPIC SUBMISSION BUTTON =========== //

    // ================== ATTACH FORUM DETAILS TO THE FORUM HEADER ================= //
    forumHeader.querySelector(".avatar img").src = forumInfo.displayPic;
    forumHeader.querySelector(".info h3").innerText = forumInfo.forumName;

    if (forumInfo.forumDesc.length > 100) {
        forumHeader.querySelector(".info .forum-desc").innerText =
        forumInfo.forumDesc.substr(0, 100) + "...";
    } else {
        forumHeader.querySelector(".info .forum-desc").innerText =
        forumInfo.forumDesc;
    }
    // ================== ATTACH FORUM DETAILS TO THE FORUM HEADER ================= //
    if (document.querySelector("#forum-description")) {
        var forumDescription = document.querySelector("#forum-description");
        // ============ ATTACH FORUM DESCRIPTION TEXT TO FORUM DESCRIPTION ============== //
        forumDescription.querySelector("p").innerText = forumInfo.forumDesc;
        // ============ATTACH CREATOR AVATAR TO FORUM DESCRIPTION ================= //
        forumDescription.querySelector(".moderators.creator").innerHTML = `
        <div class="moderator">
        <a href="/dashboard/public/member_profile/${forumInfo._id
        }/key?memberID=${creatorDetails._id}">
        <div class="profile-pic">
        <img src="../../../../uploads/${creatorDetails.avatar}" alt="">
        </div>
        </a>
        <div class="info">
        <a href="/dashboard/public/member_profile/${forumInfo._id
        }/key?memberID=${creatorDetails._id}">
        <h3>${creatorDetails.username}</h3>
        </a>
        <p>Forum Creator</p>
        <p>Created On: ${new Date(forumInfo.createdAt).toDateString()}</p>
        </div>
        </div>
        `;
        // ============ATTACH CREATOR AVATAR TO FORUM DESCRIPTION ================= //
    }


    // ================== ATTACH FORUM CREATOR AVATAR TO USER PROFILE AT THE RIGHT ============ //
    //Check if user the forum creator
    if (creatorDetails._id == theUserID) {
        document.querySelector(".forum-user-profile").innerHTML = `
        <div class="user-info">
        <a href="/dashboard/public/member_profile/${forumInfo._id
        }/key?memberID=${creatorDetails._id}">
        <div class="avatar">
        <img src="../../../../uploads/${creatorDetails.avatar}" alt="">
        </div>
        </a>
        <div class="info">
        <a href="/dashboard/public/member_profile/${forumInfo._id
        }/key?memberID=${creatorDetails._id}">
        <h3>${creatorDetails.username}</h3>
        </a>
        <p>${numberOfPosts} posts</p>
        <p>Created On: ${new Date(forumInfo.createdAt).toDateString()}</p>
        </div>
        </div>
        <button class="btn btn-primary"><i class="fa-solid fa-bookmark"></i><span>My
        Bookmarks</span></button>
        `;

        document.querySelector(".forum-user-profile").style.display = "block";
    }
    // ================== ATTACH FORUM CREATOR AVATAR TO USER PROFILE AT THE RIGHT ============ //

    if (document.querySelector("#forum-members .members")) {
        // ================== ATTACH FORUM CREATOR AVATAR TO FORUM MEMBERS PANEL ============ //
        var userCreator = document.createElement("div");
        userCreator.classList.add("member");
        userCreator.innerHTML = `
        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${creatorDetails._id}">
        <div class="profile-pic">
        <img src="../../../../uploads/${creatorDetails.avatar}" alt="">
        </div>
        </a>
        <div class="info">
        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${creatorDetails._id}">
        <h3>${creatorDetails.username}</h3>
        </a>
        <p>Creator</p>
        </div>
        `;
        document.querySelector("#forum-members .members").appendChild(userCreator);
        // ================== ATTACH FORUM CREATOR AVATAR TO FORUM MEMBERS PANEL ============ //
    }

    // ====================== UPDATE FORUM MEMBERS COUNT ======================= //
    if (forumMembers.length <= 0) {
        // if (forumInfo.members.length <= 0) {
        forumHeader.querySelector(".info .forum-member").innerText = "1 member";
    } else if (forumMembers.length > 0) {
        // } else if (forumInfo.members.length > 0) {
        forumHeader.querySelector(".info .forum-member").innerText =
        forumMembers.length + 1 + " members";
        // forumInfo.members.length + 1 + " members";
    }
    // ====================== UPDATE FORUM MEMBERS COUNT ======================= //

    // ================= UPDATE FORUM SETTINGS PANEL ================== //
    var updateForum = document.querySelector(".settings-child.update-forum-info");
    updateForum.querySelector("#availableForLookUp").checked =
    forumInfo.availableForLookUp;
    updateForum.querySelector("#membersCanInvite").checked =
    forumInfo.membersCanInvite;
    updateForum.querySelector("#forumNameInput").value = forumInfo.forumName;
    updateForum.querySelector("#forumDescInput").value = forumInfo.forumDesc;

    for (let i = 0; i < forumInfo.wordsFilter.length; i++) {
        var div = document.createElement("div");
        div.classList.add("tag");
        div.classList.add(forumInfo.wordsFilter[i]);
        div.innerHTML = ` <span class="remove-tag"
        onclick="removeFilterWord('${forumInfo.wordsFilter[i]}')">
        <i class="fa-solid fa-times"></i>
        </span>
        <p>${forumInfo.wordsFilter[i]}</p>
        `;
        updateForum.querySelector(".word-tags .up").appendChild(div);
    }
    // ================= UPDATE FORUM SETTINGS PANEL ================== //

    // ================= CHECK IF THERE ARE NO MEMBERS IN THE FORUM =================== //
    if (forumMembers.length < 1) {
        var memberPanel = document.createElement("div");
        memberPanel.classList.add("body");

        memberPanel.innerHTML = `
        <span class="text-muted">There are no members in this forum!</span>`;
        document.querySelector("#member-modal .members").appendChild(memberPanel);
        document.querySelector("#modify-member-modal .members").appendChild(memberPanel);
    }
    // ================= CHECK IF THERE ARE NO MEMBERS IN THE FORUM =================== //

    if (document.querySelector("#forum-description .moderators.mod_panel")) {
        // ================= CHECK IF THERE ARE NO MODERATORS IN THE FORUM =================== //
        if (forumInfo.moderators.length < 1) {
            var mod_panel = document.createElement("div");
            mod_panel.classList.add("body");
            mod_panel.innerHTML = `
            <span class="text-muted">There are no moderators in this forum!</span>
            `;
            document
            .querySelector("#forum-description .moderators.mod_panel")
            .appendChild(mod_panel);
        }
        // ================= CHECK IF THERE ARE NO MODERATORS IN THE FORUM =================== //
    }

    // ============== LOOP THROUGH EACH FORUM MODERATOR =============== //
    for (let i = 0; i < forumInfo.moderators.length; i++) {
        const moderator = forumInfo.moderators[i];

        for (let a = 0; a < forumMembers.length; a++) {
            const {
                member,
                memberInfo
            } = forumMembers[a];
            var memberUpvote = member.upvotes;
            let memberRank;

            if (memberUpvote < forumRanks.rookie.minUpvotesRequired) {
                memberRank = "Newbie";
            } else if (
                memberUpvote >= forumRanks.rookie.minUpvotesRequired &&
                memberUpvote < forumRanks.apprentice.minUpvotesRequired
            ) {
                memberRank = "Rookie";
            } else if (
                memberUpvote >= forumRanks.apprentice.minUpvotesRequired &&
                memberUpvote < forumRanks.explorer.minUpvotesRequired
            ) {
                memberRank = "Apprentice";
            } else if (
                memberUpvote >= forumRanks.explorer.minUpvotesRequired &&
                memberUpvote < forumRanks.contributor.minUpvotesRequired
            ) {
                memberRank = "Explorer";
            } else if (
                memberUpvote >= forumRanks.contributor.minUpvotesRequired &&
                memberUpvote < forumRanks.enthusiast.minUpvotesRequired
            ) {
                memberRank = "Contributor";
            } else if (
                memberUpvote >= forumRanks.enthusiast.minUpvotesRequired &&
                memberUpvote < forumRanks.collaborator.minUpvotesRequired
            ) {
                memberRank = "Enthusiast";
            } else if (
                memberUpvote >= forumRanks.collaborator.minUpvotesRequired &&
                memberUpvote < forumRanks.communityRegular.minUpvotesRequired
            ) {
                memberRank = "Collaborator";
            } else if (
                memberUpvote >= forumRanks.communityRegular.minUpvotesRequired &&
                memberUpvote < forumRanks.risingStar.minUpvotesRequired
            ) {
                memberRank = "Community Regular";
            } else if (
                memberUpvote >= forumRanks.risingStar.minUpvotesRequired &&
                memberUpvote < forumRanks.proficient.minUpvotesRequired
            ) {
                memberRank = "Rising Star";
            } else if (
                memberUpvote >= forumRanks.proficient.minUpvotesRequired &&
                memberUpvote < forumRanks.experienced.minUpvotesRequired
            ) {
                memberRank = "Proficient";
            } else if (
                memberUpvote >= forumRanks.experienced.minUpvotesRequired &&
                memberUpvote < forumRanks.mentor.minUpvotesRequired
            ) {
                memberRank = "Experienced";
            } else if (
                memberUpvote >= forumRanks.mentor.minUpvotesRequired &&
                memberUpvote < forumRanks.veteran.minUpvotesRequired
            ) {
                memberRank = "Mentor";
            } else if (
                memberUpvote >= forumRanks.veteran.minUpvotesRequired &&
                memberUpvote < forumRanks.master.minUpvotesRequired
            ) {
                memberRank = "Veteran";
            } else if (
                memberUpvote >= forumRanks.master.minUpvotesRequired &&
                memberUpvote < forumRanks.grandmaster.minUpvotesRequired
            ) {
                memberRank = "Master";
            } else if (
                memberUpvote >= forumRanks.grandmaster.minUpvotesRequired &&
                memberUpvote < forumRanks.lengendary.minUpvotesRequired
            ) {
                memberRank = "Grandmaster";
            } else {
                memberRank = "Legendary";
            }

            // ==================FETCH FORUM MODERATORS AND ATTACH TO SETTINGS AND FORUM DESCRIPTION ========================= //
            if (memberInfo._id == moderator.userID) {
                var div = document.createElement("div");
                div.id = "moderatorDIV_" + moderator.userID;
                div.classList.add("moderator");
                div.innerHTML = `
                <div class="info">
                <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${moderator.userID}">
                <div class="profile-pic">
                <img src="../../../../uploads/${memberInfo.avatar}" alt="">
                </div>
                </a>
                <div class="name">
                <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${moderator.userID}">
                <h4>${memberInfo.username}</h4>
                </a>
                <p>${memberRank}</p>
                </div>
                </div>
                <span class="remove-user" onclick="modifyModerators('${forumInfo._id}','${moderator.userID}', 'removeModerator')">
                <i class="fa-solid fa-user-minus"></i>
                <span>Remove</span>
                </span>
                `;
                document
                .querySelector(".settings-child.moderators .child")
                .appendChild(div);

                if (document.querySelector(".moderators.mod_panel")) {
                    var mod_panel = document.createElement("div");
                    mod_panel.classList.add("moderator");
                    if (forumInfo.moderators.length > 0) {
                        mod_panel.innerHTML = `
                        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${moderator.userID}">
                        <div class="profile-pic">
                        <img src="../../../../uploads/${memberInfo.avatar}" alt="">
                        </div>
                        </a>
                        <div class="info">
                        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${moderator.userID}">
                        <h3>${memberInfo.username}</h3>
                        </a>
                        <p>${memberRank}</p>
                        </div>
                        `;
                    }

                    document.querySelector(".moderators.mod_panel").appendChild(mod_panel);
                }
            }
            // ==================FETCH FORUM MODERATORS AND ATTACH TO SETTINGS AND FORUM DESCRIPTION ========================= //
        }
    }
    // ====================== LOOP THROUGH EACH FORUM MODERATOR ====================== //

    // ====================== LOOP THROUGH EACH FORUM MEMBER ====================== //
    for (let i = 0; i < forumMembers.length; i++) {
        const {
            member,
            memberInfo
        } = forumMembers[i];
        var memberUpvote = member.upvotes;
        let memberRank;
        if (memberUpvote < forumRanks.rookie.minUpvotesRequired) {
            memberRank = "Newbie";
        } else if (
            memberUpvote >= forumRanks.rookie.minUpvotesRequired &&
            memberUpvote < forumRanks.apprentice.minUpvotesRequired
        ) {
            memberRank = "Rookie";
        } else if (
            memberUpvote >= forumRanks.apprentice.minUpvotesRequired &&
            memberUpvote < forumRanks.explorer.minUpvotesRequired
        ) {
            memberRank = "Apprentice";
        } else if (
            memberUpvote >= forumRanks.explorer.minUpvotesRequired &&
            memberUpvote < forumRanks.contributor.minUpvotesRequired
        ) {
            memberRank = "Explorer";
        } else if (
            memberUpvote >= forumRanks.contributor.minUpvotesRequired &&
            memberUpvote < forumRanks.enthusiast.minUpvotesRequired
        ) {
            memberRank = "Contributor";
        } else if (
            memberUpvote >= forumRanks.enthusiast.minUpvotesRequired &&
            memberUpvote < forumRanks.collaborator.minUpvotesRequired
        ) {
            memberRank = "Enthusiast";
        } else if (
            memberUpvote >= forumRanks.collaborator.minUpvotesRequired &&
            memberUpvote < forumRanks.communityRegular.minUpvotesRequired
        ) {
            memberRank = "Collaborator";
        } else if (
            memberUpvote >= forumRanks.communityRegular.minUpvotesRequired &&
            memberUpvote < forumRanks.risingStar.minUpvotesRequired
        ) {
            memberRank = "Community Regular";
        } else if (
            memberUpvote >= forumRanks.risingStar.minUpvotesRequired &&
            memberUpvote < forumRanks.proficient.minUpvotesRequired
        ) {
            memberRank = "Rising Star";
        } else if (
            memberUpvote >= forumRanks.proficient.minUpvotesRequired &&
            memberUpvote < forumRanks.experienced.minUpvotesRequired
        ) {
            memberRank = "Proficient";
        } else if (
            memberUpvote >= forumRanks.experienced.minUpvotesRequired &&
            memberUpvote < forumRanks.mentor.minUpvotesRequired
        ) {
            memberRank = "Experienced";
        } else if (
            memberUpvote >= forumRanks.mentor.minUpvotesRequired &&
            memberUpvote < forumRanks.veteran.minUpvotesRequired
        ) {
            memberRank = "Mentor";
        } else if (
            memberUpvote >= forumRanks.veteran.minUpvotesRequired &&
            memberUpvote < forumRanks.master.minUpvotesRequired
        ) {
            memberRank = "Veteran";
        } else if (
            memberUpvote >= forumRanks.master.minUpvotesRequired &&
            memberUpvote < forumRanks.grandmaster.minUpvotesRequired
        ) {
            memberRank = "Master";
        } else if (
            memberUpvote >= forumRanks.grandmaster.minUpvotesRequired &&
            memberUpvote < forumRanks.lengendary.minUpvotesRequired
        ) {
            memberRank = "Grandmaster";
        } else {
            memberRank = "Legendary";
        }

        // ==================FETCH FORUM MEMBERS AND ATTACH TO MEMBERS MODAL========================= //
        var memberModalPanel = document.createElement("div");
        memberModalPanel.classList.add("member");
        memberModalPanel.id = "aModerator_" + memberInfo._id
        memberModalPanel.innerHTML = `
        <div class="info">
        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
        <div class="profile-pic">
        <img src="../../../../uploads/${memberInfo.avatar}" alt="">
        </div>
        </a>
        <div class="name">
        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
        <h4>${memberInfo.username}</h4>
        </a>
        <p>${memberRank}</p>
        </div>
        </div>
        <button class="btn btn-primary" onclick="modifyModerators('${forumInfo._id}','${memberInfo._id}', 'assignModerators', '${memberRank}', '${memberInfo.avatar}','${memberInfo.username}')" id="assignModerators_${memberInfo._id}">
        <span class="icon"><i class="fa-solid fa-plus"></i></span>
        <span class="text">Add</span>
        </button>
        `;
        document
        .querySelector("#member-modal .members")
        .appendChild(memberModalPanel);

        var modifyMemberPanel = document.createElement("div");
        modifyMemberPanel.id = "aMember_" + memberInfo._id
        modifyMemberPanel.classList.add("member");
        modifyMemberPanel.innerHTML = `
        <div class="info">
        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
        <div class="profile-pic">
        <img src="../../../../uploads/${memberInfo.avatar}" alt="">
        </div>
        </a>
        <div class="name">
        <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
        <h4>${memberInfo.username}</h4>
        </a>
        <p>${memberRank}</p>
        </div>
        </div>
        <span class="remove-user" onclick="ejectMembersPanel('${forumInfo._id}','${memberInfo._id}')">
        <i class="fa-solid fa-user-minus"></i>
        <span>Remove</span>
        </span>
        `;
        // <button class="btn btn-primary" onclick="modifyModerators('${forumInfo._id}','${memberInfo._id}', 'assignModerators', '${memberRank}', '${memberInfo.avatar}','${memberInfo.username}')" id="assignModerators_${memberInfo._id}">
        //   <span class="icon"><i class="fa-solid fa-plus"></i></span>
        //   <span class="text">Add</span>
        // </button>
        document.querySelector("#modify-member-modal .members").appendChild(modifyMemberPanel);
        // ==================FETCH FORUM MEMBERS AND ATTACH TO MEMBERS MODAL========================= //

        // ==================IF USER IS CURRENT MEMBER, ATTACH TO USER PROFILE AND FORUM MEMBERS PANEL ===================== //
        if (memberInfo._id == theUserID) {
            document.querySelector(".forum-user-profile").innerHTML = `
            <div class="user-info">
            <a href="/dashboard/public/member_profile/${forumInfo._id
            }/key?memberID=${memberInfo._id}">
            <div class="avatar">
            <img src="../../../../uploads/${memberInfo.avatar
            }" alt="">
            </div>
            </a>
            <div class="info">
            <a href="/dashboard/public/member_profile/${forumInfo._id
            }}/key?memberID=${memberInfo._id}">
            <h3>${memberInfo.username}</h3>
            </a>
            <p>${numberOfPosts} posts</p>
            <p>Joined On: ${new Date(
                member.dateJoined
            ).toLocaleDateString()}</p>
            </div>
            </div>
            <h3 style="margin-top: 10px;">Current Rank &nbsp; <i class="fa-solid fa-ranking-star"></i></h3>
            <div class="user-rank">
            <div class="rank">
            <div class="rank-badge">
            <img src="../../../../images/5.jpg" alt="">
            </div>
            <div class="rank-info">
            <h4>${memberRank}</h4>
            <p>Status:
            <span class =
            ${member.memberStatus == "active"
            ? "active": "inactive"
            }>
            <i class="fa-regular fa-circle-dot fa-2xs"></i>
            <b style="color: var(--color-success);">${member.memberStatus
            }</b>
            </span>
            </p>
            </div>
            </div>
            </div>
            <button class="btn btn-primary"><i class="fa-solid fa-bookmark"></i><span>My
            Bookmarks</span></button>
            `;

            document.querySelector(".forum-user-profile").style.display = "block";

            if (document.querySelector("#forum-members .members")) {
                var userMember = document.createElement("div");
                userMember.classList.add("member");
                userMember.innerHTML = `
                <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
                <div class="profile-pic">
                <img src="../../../../uploads/${memberInfo.avatar}" alt="">
                </div>
                </a>
                <div class="info">
                <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
                <h3>${memberInfo.username}</h3>
                </a>
                <p>${memberRank}</p>
                </div>
                `;
                document.querySelector("#forum-members .members").appendChild(userMember);
            }
        }
        // ==================IF USER IS CURRENT MEMBER, ATTACH TO USER PROFILE AND FORUM MEMBERS PANEL ===================== //

        if (document.querySelector("#forum-members .members")) {
            // ==================IF USER IS NOT CURRENT MEMBER, ATTACH TO FORUM MEMBERS PANEL ===================== //
            if (memberInfo._id != theUserID) {
                var memberPanel = document.createElement("div");
                memberPanel.classList.add("member");
                memberPanel.innerHTML = `
                <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
                <div class="profile-pic">
                <img src="../../../../uploads/${memberInfo.avatar}" alt="">
                </div>
                </a>
                <div class="info">
                <a href="/dashboard/public/member_profile/${forumInfo._id}/key?memberID=${memberInfo._id}">
                <h3>${memberInfo.username}</h3>
                </a>
                <p>${memberRank}</p>
                </div>
                `;
                document
                .querySelector("#forum-members .members")
                .appendChild(memberPanel);
            }
            // ==================IF USER IS NOT CURRENT MEMBER, ATTACH TO FORUM MEMBERS PANEL ===================== //
        }
    }
    // ====================== LOOP THROUGH EACH FORUM MEMBER ====================== //

    if (document.querySelector("#requests-to-join .moderators")) {
        // =============== ATTACH INCOMING REQUESTS TO JOIN FORUM =============== //
        if (incomingInvites.length > 0) {
            for (let i = 0; i < incomingInvites.length; i++) {
                const {
                    member
                } = incomingInvites[i];
                var div = document.createElement("div");
                div.classList.add("moderator");
                div.id = member._id;
                div.innerHTML = `
                <div class="moderator-info">
                <div class="profile-pic">
                <img src="../../../../uploads/${member.avatar}" alt="">
                </div>
                <div class="info">
                <h3>${member.username}</h3>
                <p>${member.email}</p>
                </div>
                </div>
                <div class="action">
                <span onclick="performActionAsModerator('${forumInfo._id}', '${member._id}', 'approveRequest')">Approve</span>
                <span onclick="performActionAsModerator('${forumInfo._id}', '${member._id}', 'declineRequest')">Decline</span>
                </div>
                `;
                document.querySelector("#requests-to-join .moderators").appendChild(div);
            }
        } else {
            var div = document.createElement("div");
            div.classList.add("body");
            div.innerHTML = `
            <span class="text-muted">There are no new requests to join this forum!</span>
            `;
            document.querySelector("#requests-to-join .moderators").appendChild(div);
        }
        // =============== ATTACH INCOMING REQUESTS TO JOIN FORUM =============== //
    }

    primaryAlert.style.display = "none";
}

function deleteForumTopic(id, forumID, topicID, topicCreator) {
    // if (confirm("Are you sure you want to delete this topic?")) {
    const formData = new FormData();

    formData.append("topicID", topicID);
    formData.append("forumID", forumID);
    formData.append("topicCreator", topicCreator);

    fetch("/dashboard/public/deleteATopic", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            var panel = document.querySelector(".confirm-popup");
            panel.style.display = "none"
            panel.querySelector(".card").innerHTML = "";

            if (document.getElementById("action-panel-" + id)) {
                var actionPanel = document.getElementById("action-panel-" + id)
                var actionModal = document.getElementById("action-modal-" + id)

                actionPanel.style.display = "none";
                actionModal.style.display = "none";
            }

            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
                location.assign("/dashboard/public/forum/" + forumID);
            }, 1000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
    // }
}

function deleteTopicResponse(id, forumID, topicID, responseID, responseCreator) {
    // if (confirm("Are you sure you want to delete this topic?")) {
    const formData = new FormData();

    formData.append("topicID",
        topicID);
    formData.append("forumID",
        forumID);
    formData.append("responseID",
        responseID);
    formData.append("responseCreator",
        responseCreator);

    fetch("/dashboard/public/deleteAResponse",
        {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
        })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            var panel = document.querySelector(".confirm-popup");
            panel.style.display = "none"
            panel.querySelector(".card").innerHTML = "";

            if (document.getElementById("action-panel-" + id)) {
                var actionPanel = document.getElementById("action-panel-" + id)
                var actionModal = document.getElementById("action-modal-" + id)

                actionPanel.style.display = "none";
                actionModal.style.display = "none";
            }

            // Remove response box panel
            document.querySelector(".responseBox_" + responseID).remove();
            var newCommentCount = parseInt(
                document.getElementById("comment-count").innerHTML
            );
            document.getElementById("comment-count").innerText =
            newCommentCount - 1;

            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
    // }
}

function updateTopicUpvotes(
    event,
    userID,
    topicID,
    forumID,
    actionType,
    isAMember,
    memberID
) {
    event.querySelector(".icon").style.color = "var(--color-primary)";
    if (isAMember == false) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "You are not a member of this forum!";

        setTimeout(() => {
            dangerAlert.style.display = "none";
            event.querySelector(".icon").style.color = "";
        }, 5000);
        return;
    }
    if (memberID == userID) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "You cannot upvote your own topic!";

        setTimeout(() => {
            dangerAlert.style.display = "none";
            event.querySelector(".icon").style.color = "";
        }, 5000);
        return;
    }

    if (actionType == "upvoteATopic") {
        event.querySelector(".icon").style.color = "var(--color-primary)";
        event.querySelector(".count").innerText =
        parseInt(event.querySelector(".count").innerText) + 1;
        event.title = "Remove this Topic from Upvotes";

        event.removeAttribute("onclick");
        event.setAttribute(
            "onclick",
            `updateTopicUpvotes(this, '${userID}', '${topicID}', '${forumID}', 'removeTopicFromUpvotes', ${isAMember})`
        );
    } else {
        event.querySelector(".icon").style.color = "";
        event.querySelector(".count").innerText =
        parseInt(event.querySelector(".count").innerText) - 1;
        event.title = "Upvote this Topic";

        event.removeAttribute("onclick");
        event.setAttribute(
            "onclick",
            `updateTopicUpvotes(this, '${userID}', '${topicID}', '${forumID}', "upvoteATopic", ${isAMember})`
        );
    }
    socket.emit("updateTopicUpvotes", {
        userID, topicID, forumID, actionType
    });
}

function updateResponseUpvotes(
    obj,
    userID,
    topicID,
    responseID,
    forumID,
    actionType,
    isAMember,
    memberID
) {
    obj.querySelector(".icon").style.color = "var(--color-primary)";
    if (isAMember == false) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "You are not a member of this forum!";

        setTimeout(() => {
            dangerAlert.style.display = "none";
            obj.querySelector(".icon").style.color = "";
        }, 5000);
        return;
    }
    if (memberID == userID) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "You cannot upvote your own response!";

        setTimeout(() => {
            dangerAlert.style.display = "none";
            obj.querySelector(".icon").style.color = "";
        }, 5000);
        return;
    }

    if (actionType == "upvoteAResponse") {
        obj.querySelector(".icon").style.color = "var(--color-primary)";
        obj.title = "Remove this Response from Upvotes";
        obj.querySelector(".count").innerText =
        parseInt(obj.querySelector(".count").innerText) + 1;

        obj.removeAttribute("onclick");
        obj.setAttribute(
            "onclick",
            `updateResponseUpvotes(this, '${userID}', '${topicID}', '${responseID}', '${forumID}', "removeResponseFromUpvotes", ${isAMember})`
        );
    } else {
        obj.querySelector(".icon").style.color = "";
        obj.title = "Upvote this Response";
        obj.querySelector(".count").innerText =
        parseInt(obj.querySelector(".count").innerText) - 1;

        obj.removeAttribute("onclick");
        obj.setAttribute(
            "onclick",
            `updateResponseUpvotes(this, '${userID}', '${topicID}', '${responseID}', '${forumID}', "upvoteAResponse", ${isAMember})`
        );
    }
    socket.emit("updateResponseUpvotes", {
        userID,
        topicID,
        responseID,
        forumID,
        actionType,
    });
}

function updateTopicBookmarks(
    obj,
    userID,
    topicID,
    forumID,
    actionType,
    isAMember
) {
    if (isAMember == false) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "You are not a member of this forum!";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
        return;
    }

    if (actionType == "bookmarkATopic") {
        obj.querySelector(".icon").style.color = "var(--color-primary)";
        obj.title = "Remove this Discussion from Bookmarks";
        obj.querySelector(".count").innerText =
        parseInt(obj.querySelector(".count").innerText) + 1;

        obj.removeAttribute("onclick");
        obj.setAttribute(
            "onclick",
            `updateTopicBookmarks(this, '${userID}', '${topicID}', '${forumID}', 'removeTopicFromBookmarks', ${isAMember})`
        );
    } else {
        obj.querySelector(".icon").style.color = "";
        obj.title = "Bookmark this Discussion";
        obj.querySelector(".count").innerText =
        parseInt(obj.querySelector(".count").innerText) - 1;

        obj.removeAttribute("onclick");
        obj.setAttribute(
            "onclick",
            `updateTopicBookmarks(this, '${userID}', '${topicID}', '${forumID}', 'bookmarkATopic', ${isAMember})`
        );
    }

    socket.emit("updateTopicBookmarks", {
        userID,
        topicID,
        forumID,
        actionType,
    });
}

function copyForumInviteLink(secretKey, forumID, link) {
    socket.emit("copyForumInviteLink", {
        secretKey, forumID, link
    });
}

socket.on("inviteLinkHashed", (hashedKey, forumID, newLink) => {
    navigator.clipboard.writeText(newLink);

    successAlert.style.display = "block";
    successAlertIcon.className = "";
    successAlertIcon.className = "fa fa-clipboard";
    successMessage.textContent = "Link Copied";

    setTimeout(() => {
        successAlert.style.display = "none";
    }, 3000);
});

function modifyModerators(forumID, memberID, actionType, memberRank, memberAvatar, username) {
    const formData = new FormData();
    formData.append("forumID", forumID);
    formData.append("memberID", memberID);
    formData.append("actionType", actionType);

    fetch("/dashboard/public/modifyModerators", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            switch (actionType) {
                case "assignModerators":
                    // Notify that member has been added as a moderator
                    var button = document.getElementById("assignModerators_" + memberID)
                    button.classList.remove("btn-primary")
                    button.querySelector(".icon").remove()
                    button.style.backgroundColor = "var(--color-secondary)"
                    button.querySelector(".text").innerHTML = "Added"
                    button.removeAttribute("onclick")

                    var div = document.createElement("div")
                    div.id = "moderatorDIV_" + memberID
                    div.classList.add("moderator")
                    div.innerHTML = `
                    <div class="info">
                    <a href="/dashboard/public/member_profile/${forumID}/key?memberID=${memberID}">
                    <div class="profile-pic">
                    <img src="../../../../uploads/${memberAvatar}" alt="">
                    </div>
                    </a>
                    <div class="name">
                    <a href="/dashboard/public/member_profile/${forumID}/key?memberID=${memberID}">
                    <h4>${username}</h4>
                    </a>
                    <p>${memberRank}</p>
                    </div>
                    </div>
                    <span class="remove-user" onclick="modifyModerators('${forumID}', '${memberID}', 'removeModerator')">
                    <i class="fa-solid fa-user-minus"></i>
                    <span>Remove</span>
                    </span>
                    `
                    document.querySelector(".settings-child.moderators .child").appendChild(div)
                    break;

                default:
                    //Remove Moderator by Default
                    var moderatorDIV = document.getElementById("moderatorDIV_" + memberID);
                    moderatorDIV.remove()
                    break;
            }

        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "An error occured. Please try again later";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    });
}

function updateForumProfile(forumID) {
    if (document.getElementById("availableForLookUp").checked == true) {
        var availableForLookUp = "on";
    } else {
        var availableForLookUp = "off"
    }
    if (document.getElementById("membersCanInvite").checked == true) {
        var membersCanInvite = "on";
    } else {
        var membersCanInvite = "off"
    }
    var forumName = document.getElementById("forumNameInput").value
    var forumDesc = document.getElementById("forumDescInput").value

    var wordsFilter = []
    var allTags = document.querySelectorAll(".word-tags .up div")
    for (let i = 0; i < allTags.length; i++) {
        var tagText = allTags[i].querySelector("p").innerText
        wordsFilter.push(tagText);
    }

    const formData = new FormData();
    formData.append("forumID", forumID);
    formData.append("forumName", forumName);
    formData.append("forumDesc", forumDesc);
    formData.append("lookUpValue", availableForLookUp);
    formData.append("membersCanInvite", membersCanInvite);
    formData.append("wordsFilter", wordsFilter);

    fetch("/dashboard/public/updateForumProfile", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "An error occured. Please try again later";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    });
}

function updateForumRanks(forumID, rank, minUpvotesRequiredText) {
    const formData = new FormData();
    formData.append("forumID",
        forumID);
    formData.append("rank",
        rank);
    formData.append("minUpvotesRequiredText",
        minUpvotesRequiredText);

    fetch("/dashboard/public/updateForumRanks",
        {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
        })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "An error occured. Please try again later";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    });
}

function resetRanks(forumID) {
    socket.emit("resetForumRanks",
        {
            forumID
        });
}

socket.on("ranksReset", (data) => {
    const {
        success,
        msg
    } = data

    if (success == true) {
        document.getElementById("rookie").value = 5
        document.getElementById("apprentice").value = 15
        document.getElementById("explorer").value = 30
        document.getElementById("contributor").value = 50
        document.getElementById("enthusiast").value = 75
        document.getElementById("collaborator").value = 105
        document.getElementById("communityRegular").value = 140
        document.getElementById("risingStar").value = 180
        document.getElementById("proficient").value = 225
        document.getElementById("experienced").value = 275
        document.getElementById("mentor").value = 330
        document.getElementById("veteran").value = 400
        document.getElementById("master").value = 500
        document.getElementById("grandmaster").value = 750
        document.getElementById("legendary").value = 1500

        successAlert.style.display = "block";
        successAlertIcon.className = "";
        successAlertIcon.className = "fa fa-check-circle";
        successMessage.textContent = msg;

        setTimeout(() => {
            successAlert.style.display = "none";
        }, 3000);
    }
})

function performActionInForum(forumID, topicID, actionType, isAModerator) {
    if (isAModerator == true) {
        socket.emit("performActionInForum", {
            forumID, topicID, actionType, isAModerator
        });
    } else {
        dangerAlert.style.display = "block";
        dangerMessage.textContent = "You must be a moderator to perform this action!";

        setTimeout(() => {
            dangerAlert.style.display = "none";
        }, 5000);
    }
}
socket.on("actionDone", data => {
    if (data.success == true) {
        switch (data.actionType) {
            case "pinDiscussion":
                var pinBtn = document.getElementById("pinDiscussion")
                pinBtn.querySelector("span").style.color = "var(--color-primary)"
                pinBtn.title = "Unpin Discussion"
                pinBtn.setAttribute("onclick", "performActionInForum('" + data.forumID + "', '" + data.topicID + "', 'unpinDiscussion', " + data.isAModerator + ")")
                break;
            case "unpinDiscussion":
                var pinBtn = document.getElementById("pinDiscussion")
                pinBtn.querySelector("span").style.color = ""
                pinBtn.title = "Pin Discussion"
                pinBtn.setAttribute("onclick", "performActionInForum('" + data.forumID + "', '" + data.topicID + "', 'pinDiscussion', " + data.isAModerator + ")")
                break;
            case "closeDiscussion":
                // CLOSE DISCUSSION
                var closeBtn = document.getElementById("closeDiscussion")
                closeBtn.querySelector("span").style.color = "var(--color-primary)"
                closeBtn.title = "Open Discussion"
                closeBtn.setAttribute("onclick", "performActionInForum('" + data.forumID + "', '" + data.topicID + "', 'openDiscussion', " + data.isAModerator + ")")

                // Disable Editor features
                var responseArea = document.querySelector('.response-area')
                // Check if there's any tagged message
                if (responseArea.querySelector('.tagged-msg div').innerHTML != '') {
                    responseArea.querySelector('.tagged-msg div').innerHTML = "";
                    responseArea.querySelector('.tagged-msg').style.display = "none";
                    responseArea.querySelector(".tagged-msg .icon").removeAttribute("onclick")
                }
                // Check if there's any preview
                if (responseArea.querySelector('.preview div')) {
                    responseArea.querySelectorAll('.preview div').forEach(div => {
                        div.remove()
                    })
                }
                responseArea.querySelector('.actions').style.display = "none"

                myEditor.setData('')
                myEditor.enableReadOnlyMode('response-text')
                break;
            default:
                // OPEN DISCUSSION
                var closeBtn = document.getElementById("closeDiscussion")
                closeBtn.querySelector("span").style.color = ""
                closeBtn.title = "Close Discussion"
                closeBtn.setAttribute("onclick", "performActionInForum('" + data.forumID + "', '" + data.topicID + "', 'closeDiscussion', " + data.isAModerator + ")");

                // Enable Editor features
                var responseArea = document.querySelector('.response-area')
                responseArea.querySelector('.actions').style.display = "flex";
                myEditor.disableReadOnlyMode('response-text')
                break;
        }
    }
})

function warnMemberPanel(id, forumID, memberID, topicID, deletionType, responseID) {
    socket.emit("warns",
        {
            id,
            forumID,
            memberID,
            topicID,
            deletionType,
            responseID
        });
}
socket.on("hereIsTheNumberOfWarns", data => {
    const {
        memberWarnNumber,
        id,
        forumID,
        memberID,
        topicID,
        deletionType,
        responseID
    } = data;

    var actionPanel = document.getElementById("action-panel-" + id)
    var actionModal = document.getElementById("action-modal-" + id)

    actionPanel.style.display = "none"
    actionModal.style.display = "none"

    var closeUp = document.createElement("div");
    closeUp.classList.add("close-popup");
    closeUp.setAttribute("style", "cursor: pointer;");
    closeUp.setAttribute("onclick", `cancelWarn('${id}')`);
    closeUp.innerHTML = `
    <span><i class="fa fa-times"></i></span>
    `;

    var div = document.createElement("div");
    div.classList.add("content");
    div.innerHTML = `
    <h2>Warn Member</h2>
    <span>This user has ${memberWarnNumber} warn(s) left. Help this user know what they have done wrong!</span>
    <div class="warns">
    <span class="warn">
    <input type="radio" name="warn_reason" value="Inappropriate use of language">
    <span>Inappropriate use of language</span>
    </span>
    <span class="warn">
    <input type="radio" name="warn_reason" value="Unnecessary spamming">
    <span>Unnecessary spamming</span>
    </span>
    <span class="warn">
    <input type="radio" name="warn_reason" value="Unrelated discussion in forum">
    <span>Unrelated discussion in forum</span>
    </span>
    <span class="warn">
    <input type="radio" name="warn_reason" value="Violation of other forum rules">
    <span>Violation of other forum rules</span>
    </span>
    </div>
    `;

    var actionDiv = document.createElement("div");
    actionDiv.classList.add("action");
    actionDiv.innerHTML = `
    <button class="btn" onclick="cancelWarn('${id}')">Cancel</button>
    <button class="btn btn-primary" onclick="warnMember('${id}', '${forumID}', '${memberID}', '${topicID}', '${deletionType}', '${responseID}')">Warn Member</button>
    `;

    var panel = document.querySelector(".confirm-popup");

    panel.querySelector(".card").innerHTML = "";
    panel.querySelector(".card").appendChild(closeUp);
    panel.querySelector(".card").appendChild(div);
    panel.querySelector(".card").appendChild(actionDiv);
    panel.style.display = "block";
})

function ejectMemberPanel(id, forumID, memberID, topicID, deletionType, responseID) {
    var actionPanel = document.getElementById("action-panel-" + id)
    var actionModal = document.getElementById("action-modal-" + id)

    actionPanel.style.display = "none"
    actionModal.style.display = "none"

    var closeUp = document.createElement("div");
    closeUp.classList.add("close-popup");
    closeUp.setAttribute("style",
        "cursor: pointer;");
    closeUp.setAttribute("onclick",
        `cancelEject('${id}')`);
    closeUp.innerHTML = `
    <span><i class="fa fa-times"></i></span>
    `;

    var div = document.createElement("div");
    div.classList.add("content");
    div.innerHTML = `
    <h2>Eject Member</h2>
    <span>Are you sure you want to eject this member? You can choose to warn this member instead. </span>
    `;

    var actionDiv = document.createElement("div");
    actionDiv.classList.add("action");
    actionDiv.innerHTML = `
    <button class="btn btn-danger" onclick="ejectMember('${id}', '${forumID}', '${memberID}')">No, Eject Member!</button>
    <button class="btn btn-primary" onclick="cancelEject('${id}'); warnMemberPanel('${id}', '${forumID}', '${memberID}', '${topicID}', '${deletionType}', '${responseID}');">Yes, Warn Member Instead!</button>
    `;

    var panel = document.querySelector(".confirm-popup");

    panel.querySelector(".card").innerHTML = "";
    panel.querySelector(".card").appendChild(closeUp);
    panel.querySelector(".card").appendChild(div);
    panel.querySelector(".card").appendChild(actionDiv);
    panel.style.display = "block";
}

function cancelWarn(id) {
    document.getElementsByName('warn_reason').forEach(warn => {
        warn.checked = false;
    });
    var panel = document.querySelector(".confirm-popup");
    panel.style.display = "none"
    panel.querySelector(".card").innerHTML = "";

    var actionPanel = document.getElementById("action-panel-" + id)
    var actionModal = document.getElementById("action-modal-" + id)

    actionPanel.style.display = "block";
    actionModal.style.display = "block";
}

function cancelEject(id) {
    var panel = document.querySelector(".confirm-popup");
    panel.style.display = "none"
    panel.querySelector(".card").innerHTML = "";

    if (document.getElementById("action-panel-" + id)) {
        var actionPanel = document.getElementById("action-panel-" + id)
        var actionModal = document.getElementById("action-modal-" + id)

        actionPanel.style.display = "block";
        actionModal.style.display = "block";
    }
}

function deleteResponseInForum(id, forumID, topicID, memberID, deletionType, responseID) {
    if (document.getElementById("action-panel-" + id)) {
        var actionPanel = document.getElementById("action-panel-" + id)
        var actionModal = document.getElementById("action-modal-" + id)

        actionPanel.style.display = "none"
        actionModal.style.display = "none"
    }

    var closeUp = document.createElement("div");
    closeUp.classList.add("close-popup");
    closeUp.setAttribute("style", "cursor: pointer;");
    closeUp.setAttribute("onclick", `cancelEject('${id}')`);
    closeUp.innerHTML = `
    <span><i class="fa fa-times"></i></span>
    `;

    var div = document.createElement("div");
    div.classList.add("content");
    if (deletionType == "topicDelete") {
        div.innerHTML = `
        <h2>Delete Topic</h2>
        <span>Are you sure you want to delete this topic? This topic will be deleted permanently. </span>
        `;
    } else {
        div.innerHTML = `
        <h2>Delete Response</h2>
        <span>Are you sure you want to delete this response? This response will be deleted permanently</span>
        `;
    }

    var actionDiv = document.createElement("div");
    actionDiv.classList.add("action");
    if (deletionType == "topicDelete") {
        actionDiv.innerHTML = `
        <button class="btn" onclick="cancelEject('${id}')">No</button>
        <button class="btn btn-danger" onclick="deleteForumTopic('${id}', '${forumID}', '${topicID}', '${memberID}');">Yes</button>
        `;
    } else {
        actionDiv.innerHTML = `
        <button class="btn" onclick="cancelEject('${id}')">No</button>
        <button class="btn btn-danger" onclick="deleteTopicResponse('${id}', '${forumID}', '${topicID}', '${responseID}', '${memberID}');">Yes</button>
        `;
    }

    var panel = document.querySelector(".confirm-popup");

    panel.querySelector(".card").innerHTML = "";
    panel.querySelector(".card").appendChild(closeUp);
    panel.querySelector(".card").appendChild(div);
    panel.querySelector(".card").appendChild(actionDiv);
    panel.style.display = "block";
}

function showOtherActionsInForum(id, forumID, memberID, topicID, deletionType, responseID) {
    var otherActions = document.getElementById("other-actions-" + id)

    if (!otherActions.querySelector("#action-panel-" + id)) {
        var div = document.createElement("div");

        if (deletionType == "topicDelete") {
            div.innerHTML = `
            <div class="requote" style="top: -30%; left: -13rem;" id="action-panel-${id}">
            <div class="one" onclick="warnMemberPanel('${id}', '${forumID}', '${memberID}', '${topicID}', '${deletionType}')">
            <i class="fa-solid fa-land-mine-on"></i>
            <strong>Warn Member</strong>
            </div>
            <div class="one" onclick="deleteResponseInForum('${id}','${forumID}','${topicID}','${memberID}','${deletionType}')">
            <i class="fa-solid fa-trash"></i>
            <strong>Delete Response</strong>
            </div>
            <div class="two" onclick="ejectMemberPanel('${id}','${forumID}', '${memberID}', '${topicID}', '${deletionType}')">
            <i class="fa-solid fa-user-xmark"></i>
            <strong>Eject Member</strong>
            </div>
            </div>
            <div class="requote-modal" id="action-modal-${id}" onclick="closeOtherActionsInForum(this, '${id}')"></div>
            `;
        } else {
            div.innerHTML = `
            <div class="requote other-actions" style="top: -30%;" id="action-panel-${id}">
            <div class="one" onclick="warnMemberPanel('${id}', '${forumID}', '${memberID}', '${topicID}', '${deletionType}', '${responseID}')">
            <i class="fa-solid fa-land-mine-on"></i>
            <strong>Warn Member</strong>
            </div>
            <div class="one" onclick="deleteResponseInForum('${id}','${forumID}','${topicID}','${memberID}','${deletionType}','${responseID}')">
            <i class="fa-solid fa-trash"></i>
            <strong>Delete Response</strong>
            </div>
            <div class="two" onclick="ejectMemberPanel('${id}','${forumID}', '${memberID}', '${topicID}', '${deletionType}', '${responseID}')">
            <i class="fa-solid fa-user-xmark"></i>
            <strong>Eject Member</strong>
            </div>
            </div>
            <div class="requote-modal" id="action-modal-${id}" onclick="closeOtherActionsInForum(this, '${id}')"></div>
            `;
        }

        otherActions.appendChild(div)
    } else {
        var actionPanel = document.getElementById("action-panel-" + id)
        var actionModal = document.getElementById("action-modal-" + id)

        actionPanel.style.display = "block"
        actionModal.style.display = "block"
    }
}

function closeOtherActionsInForum(obj, id) {
    var actionPanel = document.getElementById("action-panel-" + id)
    obj.style.display = "none"
    actionPanel.style.display = "none"
}

function ejectMember(id, forumID, memberID) {
    var actionType = "ejectMember";

    var panel = document.querySelector(".confirm-popup");
    panel.style.display = "none"
    panel.querySelector(".card").innerHTML = "";

    var actionPanel = document.getElementById("action-panel-" + id)
    var actionModal = document.getElementById("action-modal-" + id)

    actionPanel.style.display = "none";
    actionModal.style.display = "none";

    primaryAlert.style.display = "block";
    primaryMessage.textContent = "Processing, please wait!";

    const formData = new FormData();

    formData.append("forumID", forumID);
    formData.append("memberID", memberID);
    formData.append("actionType", actionType);

    fetch("/dashboard/public/performActionAsModerator", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            primaryAlert.style.display = "none";
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}

function warnMember(id, forumID, memberID, topicID, deletionType, responseID) {
    var reasonForWarning;
    document.getElementsByName('warn_reason').forEach(warn => {
        if (warn.checked == true) {
            reasonForWarning = warn.value;
        }
        warn.checked = false;
    });
    if (reasonForWarning == undefined) {
        reasonForWarning = "null";
    }
    var panel = document.querySelector(".confirm-popup");
    panel.style.display = "none"
    panel.querySelector(".card").innerHTML = "";

    var actionPanel = document.getElementById("action-panel-" + id)
    var actionModal = document.getElementById("action-modal-" + id)

    actionPanel.style.display = "none";
    actionModal.style.display = "none";

    var actionType = "warnMembers";
    primaryAlert.style.display = "block";
    primaryMessage.textContent = "Processing, please wait!";

    const formData = new FormData();

    formData.append("forumID", forumID);
    formData.append("memberID", memberID);
    formData.append("topicID", topicID);
    formData.append("actionType", actionType);
    formData.append("deletionType", deletionType);
    formData.append("reasonForWarning", reasonForWarning);
    if (deletionType == "responseDelete") formData.append("responseID", responseID);

    fetch("/dashboard/public/performActionAsModerator", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            primaryAlert.style.display = "none";
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            document.getElementById(id).remove();

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}

function performActionAsModerator(forumID, memberID, actionType) {
    if (actionType == "approveRequest") {
        primaryAlert.style.display = "block";
        primaryMessage.textContent = "Processing, please wait!";
    }

    const formData = new FormData();

    formData.append("forumID", forumID);
    formData.append("memberID", memberID);
    formData.append("actionType", actionType);

    fetch("/dashboard/public/performActionAsModerator", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            if (actionType == "approveRequest") {
                primaryAlert.style.display = "none";
                successAlert.style.display = "block";
                successAlertIcon.className = "";
                successAlertIcon.className = "fa fa-check-circle";
                successMessage.textContent = json.msg;

                setTimeout(() => {
                    successAlert.style.display = "none";
                }, 3000);
            }
            document.getElementById(memberID).remove();
            if (!document.querySelector("#requests-to-join .moderators .moderator")) {
                var div = document.createElement("div");
                div.classList.add("body");
                div.innerHTML = `
                <span class="text-muted">There are no new requests to join this forum!</span>
                `;
                document.querySelector("#requests-to-join .moderators").appendChild(div);
            }
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}

function getTopicCategories(forumID) {
    socket.emit("getTopicCategories",
        {
            forumID
        })
}
socket.on("topicCategories", data => {
    const {
        latestTopics,
        pinnedTopics,
        trendingTopics
    } = data;

    var trendingTopicsHTML = trendingTopics.map(topic => {
        return `
        <a href="/dashboard/public/forum/${forumID}/key?topicID=${topic.topic._id}">
        <div class="message" style="padding: 5px 0;">
        <div class="profile-pic">
        <img src="../../../../uploads/${topic.userInfo.avatar}" alt="">
        </div>
        <div class="message-body">
        <h5 style="font-size: 13px; font-weight: 600;">${topic.topic.subject.length > 100
        ? topic.topic.subject.substr(0, 30) + "...": topic.topic.subject
        }</h5>
        <div>
        <p class="text-muted">By <span>${topic.userInfo.username}</span>,
        <b>${new Date(topic.topic.createdAt).toDateString()}</b> <span class="fa fa-clock"></span></p>
        </div>
        </div>
        </div>
        </a>
        `;
    }).join("");

    var latestTopicsHTML = latestTopics.map(topic => {
        return `
        <a href="/dashboard/public/forum/${forumID}/key?topicID=${topic.topic._id}">
        <div class="message" style="padding: 5px 0;">
        <div class="profile-pic">
        <img src="../../../../uploads/${topic.userInfo.avatar}" alt="">
        </div>
        <div class="message-body">
        <h5 style="font-size: 13px; font-weight: 600;">${topic.topic.subject.length > 100
        ? topic.topic.subject.substr(0, 30) + "...": topic.topic.subject
        }</h5>
        <div>
        <p class="text-muted">By <span>${topic.userInfo.username}</span>,
        <b>${new Date(topic.topic.createdAt).toDateString()}</b> <span class="fa fa-clock"></span></p>
        </div>
        </div>
        </div>
        </a>
        `;
    }).join("");

    var pinnedTopicsHTML = pinnedTopics.map(topic => {
        return `
        <a href="/dashboard/public/forum/${forumID}/key?topicID=${topic.topic._id}">
        <div class="message" style="padding: 5px 0;">
        <div class="profile-pic">
        <img src="../../../../uploads/${topic.userInfo.avatar}" alt="">
        </div>
        <div class="message-body">
        <h5 style="font-size: 13px; font-weight: 600;">${topic.topic.subject.length > 100
        ? topic.topic.subject.substr(0, 30) + "...": topic.topic.subject
        }</h5>
        <div>
        <p class="text-muted">By <span>${topic.userInfo.username}</span>,
        <b>${new Date(topic.topic.createdAt).toDateString()}</b> <span class="fa fa-clock"></span></p>
        </div>
        </div>
        </div>
        </a>
        `;
    }).join("");

    document.querySelector("#pinned-topics .scroll-bar").innerHTML = pinnedTopicsHTML;
    document.querySelector("#pinned-topics-middle .scroll-bar").innerHTML = pinnedTopicsHTML;

    document.querySelector("#newest-topics .scroll-bar").innerHTML = latestTopicsHTML;
    document.querySelector("#newest-topics-middle .scroll-bar").innerHTML = latestTopicsHTML;

    document.querySelector("#trending-topics .scroll-bar").innerHTML = trendingTopicsHTML;
    document.querySelector("#trending-topics-middle .scroll-bar").innerHTML = trendingTopicsHTML;
})

function ejectMembersPanel(forumID, memberID) {
    var closeUp = document.createElement("div");
    closeUp.classList.add("close-popup");
    closeUp.setAttribute("style",
        "cursor: pointer;");
    closeUp.setAttribute("onclick",
        `cancelEjectMembers()`);
    closeUp.innerHTML = `
    <span><i class="fa fa-times"></i></span>
    `;

    var div = document.createElement("div");
    div.classList.add("content");
    div.innerHTML = `
    <h2>Eject Member</h2>
    <span>Are you sure you want to eject this member? This user will need an approval from a moderator before they can join back. </span>
    `;

    var actionDiv = document.createElement("div");
    actionDiv.classList.add("action");
    actionDiv.innerHTML = `
    <button class="btn btn-danger" onclick="cancelEjectMembers()">No</button>
    <button class="btn btn-primary" onclick="ejectMembers('${forumID}', '${memberID}');">Yes</button>
    `;

    var panel = document.querySelector(".confirm-popup");
    panel.querySelector(".card").innerHTML = "";
    panel.querySelector(".card").appendChild(closeUp);
    panel.querySelector(".card").appendChild(div);
    panel.querySelector(".card").appendChild(actionDiv);
    panel.style.display = "block";
}

function cancelEjectMembers() {
    var panel = document.querySelector(".confirm-popup");
    panel.style.display = "none"
    panel.querySelector(".card").innerHTML = "";
}

function ejectMembers(forumID, memberID) {
    var actionType = "ejectMember";

    var panel = document.querySelector(".confirm-popup");
    panel.style.display = "none"
    panel.querySelector(".card").innerHTML = "";

    const formData = new FormData();

    formData.append("forumID",
        forumID);
    formData.append("memberID",
        memberID);
    formData.append("actionType",
        actionType);

    fetch("/dashboard/public/performActionAsModerator",
        {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
        })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            primaryAlert.style.display = "none";
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);

            document.getElementById("aMember_" + memberID).remove()
            if (document.getElementById("aModerator_" + memberID)) {
                document.getElementById("aModerator_" + memberID).remove()
            }
            if (!document.querySelector("#modify-member-modal .members .member")) {
                var memberPanel = document.createElement("div");
                memberPanel.classList.add("body");

                memberPanel.innerHTML = `
                <span class="text-muted">There are no members in this forum!</span>`;
                document.querySelector("#modify-member-modal .members").appendChild(memberPanel);
            }
            if (!document.querySelector("#member-modal .members .member")) {
                var memberPanel = document.createElement("div");
                memberPanel.classList.add("body");

                memberPanel.innerHTML = `
                <span class="text-muted">There are no members in this forum!</span>`;
                document.querySelector("#member-modal .members").appendChild(memberPanel);
            }
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}

function sendRequestToJoin(event, forumID, actionType) {
    event.innerHTML = `
    <span>Sending...</span>
    `;
    const formData = new FormData();

    formData.append("forumID",
        forumID);
    formData.append("actionType",
        actionType);

    fetch("/dashboard/public/updateForumInvites",
        {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
        })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            event.setAttribute("onclick", `cancelRequestToJoin(this, '${forumID}', 'rejectInvites')`);
            event.innerHTML = `
            <i class="fa-solid fa-user-times"></i> <span>Cancel Request</span>
            `;
            event.classList.remove("btn-primary");
            event.style.backgroundColor = "var(--color-danger)";

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}

function cancelRequestToJoin(event, forumID, actionType) {
    const formData = new FormData();

    formData.append("forumID",
        forumID);
    formData.append("actionType",
        actionType);

    fetch("/dashboard/public/updateForumInvites",
        {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
        })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            event.setAttribute("onclick", `sendRequestToJoin(this, '${forumID}', 'sendRequestToJoin')`);
            event.innerHTML = `
            <i class="fa-solid fa-person-circle-plus"></i> <span>Request to Join</span>
            `;
            event.style.backgroundColor = "";
            event.classList.add("btn-primary");
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });

}

function sendRequestToJoinTwo(event, forumID, actionType) {
    event.innerHTML = `
    <strong>Sending...</strong>
    `;
    const formData = new FormData();

    formData.append("forumID",
        forumID);
    formData.append("actionType",
        actionType);

    fetch("/dashboard/public/updateForumInvites",
        {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
        })
    .then(function (res) {
        return res.json();
    })
    .then(function (json) {
        if (json.success == true) {
            successAlert.style.display = "block";
            successAlertIcon.className = "";
            successAlertIcon.className = "fa fa-check-circle";
            successMessage.textContent = json.msg;

            event.removeAttribute("onclick");
            event.innerHTML = `
            <strong>Request sent</strong>
            `;

            setTimeout(() => {
                successAlert.style.display = "none";
            }, 3000);
        } else {
            dangerAlert.style.display = "block";
            dangerMessage.textContent = json.msg;

            setTimeout(() => {
                dangerAlert.style.display = "none";
            }, 5000);
        }
    })
    .catch(function (err) {
        console.log(err);
    });
}

function notificationsPanel(forumID, userID, enablePushNotifications, subscriptionObject) {
    var closeUp = document.createElement("div");
    closeUp.classList.add("close-popup");
    closeUp.setAttribute("style",
        "cursor: pointer;");
    closeUp.setAttribute("onclick",
        `cancelEjectMembers()`);
    closeUp.innerHTML = `
    <span><i class="fa fa-times"></i></span>
    `;

    var div = document.createElement("div");
    div.classList.add("content");
    div.innerHTML = `
    <h2>Get Notified of new topics and responses</h2>
    <div class="notification">
    <span>
    <h4>Topics Only</h4>
    </span>
    <label class="toggle">
    <input class="toggle-input" type="checkbox" id="topics-only" onclick="subscribeToForumNotifications('${forumID}', '${userID}', 'topics-only', '${enablePushNotifications}', '${subscriptionObject}')" />
    <span class="toggle-label" data-off="OFF" data-on="ON"></span>
    <span class="toggle-handle"></span>
    </label>
    </div>
    <div class="notification">
    <span>
    <h4>Topics and Responses</h4>
    </span>
    <label class="toggle">
    <input class="toggle-input" type="checkbox" id="topics-and-responses" onclick="subscribeToForumNotifications('${forumID}', '${userID}', 'topics-and-responses', '${enablePushNotifications}', '${subscriptionObject}')" />
    <span class="toggle-label" data-off="OFF" data-on="ON"></span>
    <span class="toggle-handle"></span>
    </label>
    </div>
    <div class="notification">
    <span>
    <h4>Push Notifications</h4>
    </span>
    <label class="toggle">
    <input class="toggle-input" type="checkbox" id="push-notifications" onclick="subscribeToForumNotifications('${forumID}', '${userID}', 'push-notifications', '${enablePushNotifications}', '${subscriptionObject}')" />
    <span class="toggle-label" data-off="OFF" data-on="ON"></span>
    <span class="toggle-handle"></span>
    </label>
    </div>
    `;

    var panel = document.querySelector(".confirm-popup");
    panel.querySelector(".card").innerHTML = "";
    panel.querySelector(".card").appendChild(closeUp);
    panel.querySelector(".card").appendChild(div);
    panel.style.display = "block";
}

function subscribeToForumNotifications(forumID, userID, subscriptionType, enablePushNotifications, subscriptionObject) {
    var topicsOnly = document.getElementById("topics-only");
    var topicsAndResponses = document.getElementById("topics-and-responses");
    var pushNotifications = document.getElementById("push-notifications");

    if (subscriptionType == "topics-only") {
        if (topicsAndResponses.checked == true) {
            topicsAndResponses.checked = false;
        }

        if (topicsOnly.checked == true) {
            // Send msg to server to update subscription type to topic only
            console.log("Send msg to server to update subscription type to topic only")
            var actionType = "subscribe"
            socket.emit("subscribeToForumNotifications", {
                forumID, userID, subscriptionType, actionType
            });
        } else {
            // Send msg to server to unsubscribe user from notifications
            console.log("Send msg to server to unsubscribe user from notifications")
            var actionType = "unsubscribe";
            socket.emit("subscribeToForumNotifications", {
                forumID, userID, subscriptionType, actionType
            });
            if (pushNotifications.checked == true) {
                // Unsubscribe user from push notifications
                pushNotifications.checked = false;
            }
        }
    } else if (subscriptionType == "topics-and-responses") {
        if (topicsOnly.checked == true) {
            topicsOnly.checked = false;
        }

        if (topicsAndResponses.checked == true) {
            // Send msg to server to update subscription type to topics and responses
            console.log("Send msg to server to update subscription type to topics and responses");
            var actionType = "subscribe"
            socket.emit("subscribeToForumNotifications", {
                forumID, userID, subscriptionType, actionType
            });
        } else {
            // Send msg to server to unsubscribe user from notifications
            console.log("Send msg to server to unsubscribe user from notifications")
            var actionType = "unsubscribe";
            socket.emit("subscribeToForumNotifications", {
                forumID, userID, subscriptionType, actionType
            });
            if (pushNotifications.checked == true) {
                // Unsubscribe user from push notifications
                pushNotifications.checked = false;
            }
        }
    } else {
        // Push Notifications by default
        if (pushNotifications.checked == true) {
            // If user has selected a subscription type
            if (topicsOnly.checked == true || topicsAndResponses.checked == true) {
                // Then proceed and subscribe user to push Notifications
                console.log("Subscribe user to push notifications")
                var actionType = "subscribe";
                subscribeToPushNotifications(forumID, userID, actionType);
            } else {
                // Else, inform user to select a subscription type
                pushNotifications.checked = false;
                console.log("Please select a subscription type first")
            }
        } else {
            // Unsubscribe user from push notifications
            console.log("Unsubscribe user from push notifications")
            var actionType = "unsubscribe";
            unsubscribeFromPushNotifications(forumID, userID, actionType);
        }
    }
}

async function subscribeToPushNotifications(forumID, userID, actionType) {
    console.log("subscribe to push notifications")
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Request push notification permission from user
        Notification.requestPermission().then(async (permission) => {
            if (permission === "granted") {
                // Register Service Worker File
                const register = await navigator.serviceWorker.ready;

                //Get active subscriptions
                await register.pushManager.getSubscription().then(async (getSubscription) => {
                    //Check if there is an active subscription
                    if (!getSubscription) {
                        const subscription = await register.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
                        });

                        var sub = JSON.stringify(subscription);
                    } else {
                        var sub = JSON.stringify(getSubscription);
                    }

                    socket.emit("subscribeToForumPushNotifications", {
                        forumID, userID, actionType, subscription: sub
                    });
                })
            } else {}
        })
    } else {}
}
async function unsubscribeFromPushNotifications(forumID, userID, actionType) {
    console.log("Unsubscribe from push notifications")
    const register = await navigator.serviceWorker.ready;

    //Get active subscriptions
    await register.pushManager.getSubscription().then(async (getSubscription) => {
        getSubscription.unsubscribe().then((successful) => {
            console.log(successful);
        }).catch((err) => console.error(err))

        var sub = JSON.stringify(getSubscription);

        socket.emit("subscribeToForumPushNotifications", {
            forumID, userID, actionType, subscription: sub
        });
    })
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function updateNotification(notification, userID, linkUrl) {
    socket.emit("updateNotification", {
        notification, userID, linkUrl
    });
}

socket.on("notificationUpdated", data => {
    window.location.href = data.linkUrl
})