socket.on("start_or_join_room", async (roomID, userID, username) => {
  await socket.join(roomID);
  const numMembers = io.sockets.adapter.rooms.get(roomID).size;
  console.log("Room ID: " + roomID + " has " + numMembers + " participants");

  if (numMembers == 1) {
    //Start Meeting
    socket.emit("roomCreated", roomID, userID, username);
    socket.to(roomID).emit("newUser", { roomID, username });
  } else if (numMembers > 1) {
    //Join Meeting
    socket.emit("roomJoined", roomID, userID, username);
    socket.to(roomID).emit("newUser", { roomID, username });
  }
});

socket.on("ready", (roomNumber, userID) => {
  var roomID = roomNumber;
  socket.broadcast.to(roomID).emit("ready", roomID, userID);
});
socket.on("candidate", (event) => {
  socket.broadcast.to(event.roomID).emit("candidate", event);
});
socket.on("offer", (event) => {
  socket.broadcast.to(event.roomID).emit("offer", event.sdp, event.userID);
});
socket.on("answer", (event) => {
  socket.broadcast.to(event.roomID).emit("answer", event.sdp);
});

socket.channels = {};
sockets[socket.id] = socket;

console.log("[" + socket.id + "] connection accepted");
socket.on("disconnect", function () {
  for (var channel in socket.channels) {
    part(channel);
  }
  console.log("[" + socket.id + "] disconnected");
  delete sockets[socket.id];
});

socket.on("join", function (config) {
  // console.log("[" + socket.id + "] join ", config);
  var channel = config.channel;
  var userdata = config.userdata;

  if (channel in socket.channels) {
    console.log("[" + socket.id + "] ERROR: already joined ", channel);
    return;
  }

  if (!(channel in channels)) {
    channels[channel] = {};
  }

  for (id in channels[channel]) {
    channels[channel][id].emit("addPeer", {
      userID: userdata.userID,
      peer_id: socket.id,
      should_create_offer: false,
    });
    socket.emit("addPeer", {
      userID: userdata.userID,
      peer_id: id,
      should_create_offer: true,
    });
  }

  channels[channel][socket.id] = socket;
  socket.channels[channel] = channel;
});

function part(channel) {
  console.log("[" + socket.id + "] part ");

  if (!(channel in socket.channels)) {
    console.log("[" + socket.id + "] ERROR: not in ", channel);
    return;
  }

  delete socket.channels[channel];
  delete channels[channel][socket.id];

  for (id in channels[channel]) {
    channels[channel][id].emit("removePeer", { peer_id: socket.id });
    socket.emit("removePeer", { peer_id: id });
  }
}
socket.on("part", part);

socket.on("relayICECandidate", function (config) {
  var peer_id = config.peer_id;
  var ice_candidate = config.ice_candidate;
  // console.log(
  //   "[" + socket.id + "] relaying ICE candidate to [" + peer_id + "] ",
  //   ice_candidate
  // );

  if (peer_id in sockets) {
    sockets[peer_id].emit("iceCandidate", {
      peer_id: socket.id,
      ice_candidate: ice_candidate,
    });
  }
});

socket.on("relaySessionDescription", function (config) {
  var peer_id = config.peer_id;
  var session_description = config.session_description;
  // console.log(
  //   "[" + socket.id + "] relaying session description to [" + peer_id + "] ",
  //   session_description
  // );

  if (peer_id in sockets) {
    sockets[peer_id].emit("sessionDescription", {
      peer_id: socket.id,
      session_description: session_description,
    });
  }
});

socket.on("myDetails", (obj) => {
  socket.emit("dataChannel", obj);
});

var signaling_socket = null;
var local_media_stream = null;
var peers = {};
var peer_media_elements = {};

const streamConstraints = {
  audio: true,
  video: true,
};

socket.on("dataChannel", (obj) => {
  console.log("User msg: " + obj);
});

function init() {
  // console.log("Connecting to signaling server");
  signaling_socket = io();

  signaling_socket.on("connect", function () {
    console.log("Connected to signaling server");
    setup_local_media(function () {
      join_chat_channel(DEFAULT_CHANNEL, { userID: myID });
    });
  });
  signaling_socket.on("disconnect", function () {
    console.log("Disconnected from signaling server");
    for (peer_id in peer_media_elements) {
      peer_media_elements[peer_id].remove();
    }
    for (peer_id in peers) {
      peers[peer_id].close();
    }
    peers = {};
    peer_media_elements = {};
  });
  function join_chat_channel(channel, userdata) {
    signaling_socket.emit("join", { channel, userdata });
  }
  function part_chat_channel(channel) {
    signaling_socket.emit("part", channel);
  }

  signaling_socket.on("addPeer", function (config) {
    var peer_id = config.peer_id;
    var userID = config.userID;
    const UID = uuid();

    if (peer_id in peers) {
      console.log("Already connected to peer ", peer_id);
      return;
    }
    var peer_connection = new RTCPeerConnection(
      { iceServers: ICE_SERVERS },
      { optional: [{ DtlsSrtpKeyAgreement: true }] }
    );
    peers[peer_id] = peer_connection;

    peer_connection.onicecandidate = function (event) {
      if (event.candidate) {
        signaling_socket.emit("relayICECandidate", {
          peer_id: peer_id,
          ice_candidate: {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            candidate: event.candidate.candidate,
          },
        });
      }
    };

    peer_connection.ontrack = function (event) {
      console.log(
        "User with ID: " +
          userID +
          " and the Host is: " +
          roomHost +
          " and my ID is: " +
          UID
      );

      const memberFrame = document.createElement("div");
      memberFrame.classList.add("member-frame");
      memberFrame.classList.add("userID" + UID);
      // memberFrame.setAttribute("id", userID);

      const memberVideo = document.createElement("video");
      memberVideo.muted = true;
      memberVideo.addEventListener("loadedmetadata", () => {
        memberVideo.play();
      });

      memberFrame.appendChild(memberVideo);
      peer_media_elements[peer_id] = memberFrame;
      memberFrames.appendChild(memberFrame);
      attachMediaStream(memberVideo, event.streams[0]);

      var frameArray = document.querySelectorAll(".userID" + UID);

      for (let i = 1; i < frameArray.length; i++) {
        frameArray[i].remove();
      }

      // console.log(peer_media_elements);
    };

    /* Add our local stream */
    peer_connection.addStream(local_media_stream);

    // dataChannel = peer_connection.createDataChannel(DEFAULT_CHANNEL);
    if (config.should_create_offer) {
      console.log("Creating RTC offer to ", peer_id);
      peer_connection.createOffer(
        function (local_description) {
          // console.log("Local offer description is: ", local_description);
          peer_connection.setLocalDescription(
            local_description,
            function () {
              signaling_socket.emit("relaySessionDescription", {
                peer_id: peer_id,
                session_description: local_description,
              });
              console.log("Offer setLocalDescription succeeded");
            },
            function () {
              Alert("Offer setLocalDescription failed!");
            }
          );
        },
        function (error) {
          console.log("Error sending offer: ", error);
        }
      );
    }

    // dataChannel.onmessage = (event) => {
    //   var details = JSON.parse(event.data);
    //   const newMessage = document.createElement("div");
    //   newMessage.classList.add("user-message");
    //   newMessage.innerHTML = `
    //                         <div class="pic">
    //                             <img src="../../../uploads/${details.myAvatar}" alt="">
    //                         </div>
    //                         <div class="msg">
    //                             <em style="margin-right: 10px;"><b>${details.myUsername}</b></em> ${details.message}
    //                         </div>
    //                     </div>`;
    //   document
    //     .querySelector("#channel-container .bodys")
    //     .appendChild(newMessage);
    //   document
    //     .querySelector("#channel-container2 .bodys")
    //     .appendChild(newMessage.cloneNode(true));
    // };

    // peer_connection.ondatachannel = (event) => {
    //   dataChannel = event.channel;
    //   dataChannel.onmessage = (event) => {
    //     var details = JSON.parse(event.data);
    //     const newMessage = document.createElement("div");
    //     newMessage.classList.add("user-message");
    //     newMessage.innerHTML = `
    //                         <div class="pic">
    //                             <img src="../../../uploads/${details.myAvatar}" alt="">
    //                         </div>
    //                         <div class="msg">
    //                             <em style="margin-right: 10px;"><b>${details.myUsername}</b></em> ${details.message}
    //                         </div>
    //                     </div>`;
    //     document
    //       .querySelector("#channel-container .bodys")
    //       .appendChild(newMessage);
    //     document
    //       .querySelector("#channel-container2 .bodys")
    //       .appendChild(newMessage.cloneNode(true));
    //   };
    // };
  });

  signaling_socket.on("sessionDescription", function (config) {
    var peer_id = config.peer_id;
    var peer = peers[peer_id];
    var remote_description = config.session_description;

    var desc = new RTCSessionDescription(remote_description);
    var stuff = peer.setRemoteDescription(
      desc,
      function () {
        console.log("setRemoteDescription succeeded");
        if (remote_description.type == "offer") {
          console.log("Creating answer");
          peer.createAnswer(
            function (local_description) {
              peer.setLocalDescription(
                local_description,
                function () {
                  signaling_socket.emit("relaySessionDescription", {
                    peer_id: peer_id,
                    session_description: local_description,
                  });
                  console.log("Answer setLocalDescription succeeded");
                },
                function () {
                  Alert("Answer setLocalDescription failed!");
                }
              );
            },
            function (error) {
              console.log("Error creating answer: ", error);
              console.log(peer);
            }
          );
        }
      },
      function (error) {
        console.log("setRemoteDescription error: ", error);
      }
    );
    // console.log("Description Object: ", desc);
  });

  signaling_socket.on("iceCandidate", function (config) {
    var peer = peers[config.peer_id];
    var ice_candidate = config.ice_candidate;
    peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
  });

  signaling_socket.on("removePeer", function (config) {
    console.log("Signaling server said to remove peer:", config);
    var peer_id = config.peer_id;
    if (peer_id in peer_media_elements) {
      peer_media_elements[peer_id].remove();
    }
    if (peer_id in peers) {
      peers[peer_id].close();
    }

    delete peers[peer_id];
    delete peer_media_elements[config.peer_id];
  });
}

/***********************/
/** Local media stuff **/
/***********************/
function setup_local_media(callback, errorback) {
  if (local_media_stream != null) {
    if (callback) callback();
    return;
  }
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  attachMediaStream = function (element, stream) {
    element.srcObject = stream;
  };

  navigator.mediaDevices
    .getUserMedia({ audio: USE_AUDIO, video: USE_VIDEO })
    .then((stream) => {
      console.log("Access granted to audio/video");
      local_media_stream = stream;
      const memberFrame = document.createElement("div");
      memberFrame.classList.add("member-frame");
      memberFrame.setAttribute("id", myID);

      const memberVideo = document.createElement("video");
      memberVideo.muted = true;
      memberVideo.addEventListener("loadedmetadata", () => {
        memberVideo.play();
      });
      memberFrame.appendChild(memberVideo);
      memberFrames.appendChild(memberFrame);
      attachMediaStream(memberVideo, stream);

      if (callback) callback();
    })
    .catch((err) => {
      console.log("Access denied for audio/video", err);
      if (errorback) errorback();
    });
}

function sendChannelMessage() {
  const message = document.getElementById("channel_message").value;
  let obj = {
    message,
    myAvatar,
    myUsername,
  };
  // dataChannel.send(JSON.stringify(obj));
  socket.emit("myDetails", obj);
  const newMessage = document.createElement("div");
  newMessage.classList.add("user-message");
  newMessage.innerHTML = `
                            <div class="pic">
                                <img src="../../../uploads/${myAvatar}" alt="">
                            </div>
                            <div class="msg">
                                <em style="margin-right: 10px;"><b>${myUsername}</b></em> ${message}
                            </div>
                        </div>`;
  document.querySelector("#channel-container .bodys").appendChild(newMessage);
  document
    .querySelector("#channel-container2 .bodys")
    .appendChild(newMessage.cloneNode(true));
  document.getElementById("channel_message").value = "";
}

function sendChannelMessage2() {
  const message = document.getElementById("channel_message2").value;
  let obj = {
    message,
    myAvatar,
    myUsername,
  };
  // dataChannel.send(JSON.stringify(obj));
  socket.emit("myDetails", obj);
  const newMessage = document.createElement("div");
  newMessage.classList.add("user-message");
  newMessage.innerHTML = `
                            <div class="pic">
                                <img src="../../../uploads/${myAvatar}" alt="">
                            </div>
                            <div class="msg">
                                <em style="margin-right: 10px;"><b>${myUsername}</b></em> ${message}
                            </div>
                        </div>`;
  document.querySelector("#channel-container .bodys").appendChild(newMessage);
  document
    .querySelector("#channel-container2 .bodys")
    .appendChild(newMessage.cloneNode(true));
  document.getElementById("channel_message2").value = "";
}

const USE_AUDIO = true;
const USE_VIDEO = true;
const DEFAULT_CHANNEL = verifiedRoomID;
const MUTE_AUDIO_BY_DEFAULT = false;

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.services.mozilla.com" },
];
