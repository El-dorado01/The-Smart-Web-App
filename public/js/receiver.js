/*
-- Send userID

*/

var socket = io();
var localStream;
var peerConnection;

socket.on("offer", (response) => {
  peerConnection.setRemoteDescription = response.offer;
  createAndSendAnswer();
});
socket.on("candidate", (response) => {
  peerConnection.addIceCandidate = response.candidate;
});

function createAndSendAnswer() {
  peerConnection.createAnswer(
    (answer) => {
      peerConnection.setLocalDescription(answer);

      socket.emit("send_answer", answer);
    },
    (error) => {
      console.log(error);
    }
  );
}

function joinRoom(userID) {
  //Emit userID and roomID to the server
  const roomID = document.getElementById("joinRoomID").value;
  //   socket.emit("verifyRoomID", { roomID, userID });

  navigator.mediaDevices
    .getUserMedia({
      video: true,
      //provide constraints
      audio: true,
    })
    .then((stream) => {
      localStream = stream;
      const hostVideo = document.getElementById("host-frame");
      hostVideo.muted = true;

      hostVideo.srcObject = localStream;
      hostVideo.addEventListener("loadedmetadata", () => {
        hostVideo.play();
      });
      const hostFrame = document.querySelector(".host-frame");
      hostFrame.style.display = "block";

      let configuration = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
      };
      peerConnection = new RTCPeerConnection(configuration);
      peerConnection.addStream(localStream);

      peerConnection.onaddstream = (e) => {
        const allMembersFrame = document.querySelector(".member-frames");

        const memberFrame = document.createElement("div");
        memberFrame.classList.add("member-frame");
        memberFrame.setAttribute("id", userID);
        memberFrame.setAttribute(
          "onmouseenter",
          `showVideoButtons2('show', ${userID})`
        );
        memberFrame.setAttribute(
          "onmouseleave",
          `showVideoButtons2('hide', ${userID})`
        );
        memberFrame.innerHTML = `
        <div class="actions">
        <span><i class="fa-solid fa-phone-slash"></i></span>
        <span><i class="fa-solid fa-video-slash"></i></span>
        <span><i class="fa fa-microphone-lines"></i></span>
        </div>
        `;

        const memberVideo = document.createElement("video");

        call.on("stream", (memberVideoStream) => {
          // Remote Stream
          memberVideo.srcObject = e.stream;
          memberVideo.addEventListener("loadedmetadata", () => {
            memberVideo.play();
          });
        });

        memberFrame.appendChild(memberVideo);
        allMembersFrame.appendChild(memberFrame);
      };

      peerConnection.onicecandidate((e) => {
        if (e.candidate == null) return;

        //Send Candidate and store to server
        socket.emit("send_candidate", e.candidate);
      });

      socket.emit("joinCall", userID);
    });
  console.log(roomID, userID);
}

var isAudio = true;
function muteAudio() {
  isAudio = !isAudio;
  localStream.getAudioTracks()[0].enabled = isAudio;
}

var isVideo = true;
function muteVideo() {
  isVideo = !isVideo;
  localStream.getVideoTracks()[0].enabled = isVideo;
}

socket.on("newUser", (response) => {
  const username = response.username;
  const roomID = response.roomID;
  const botMsg = document.createElement("div");
  botMsg.classList.add("bot-message");
  botMsg.innerHTML = `
                      <p><i class="fas fa-robot"></i> <span>Smart Bot</span></p>
                      <p>${username} has joined the room (${roomID})</p>
                    `;
  document.querySelector("#channel-container .bodys").appendChild(botMsg);
  document
    .querySelector("#channel-container2 .bodys")
    .appendChild(botMsg.cloneNode(true));
});

socket.on("roomCreated", (roomID, userID, username) => {
  navigator.mediaDevices
    .getUserMedia(streamConstraints)
    .then((stream) => {
      localStream = stream;

      if (roomHost === userID) {
        hostVideo.muted = true;
        hostVideo.srcObject = stream;
        hostVideo.addEventListener("loadedmetadata", () => {
          hostVideo.play();
        });
        hostFrame.style.display = "block";
      } else {
        const memberFrame = document.createElement("div");
        memberFrame.classList.add("member-frame");
        memberFrame.setAttribute("id", userID);
        memberFrame.setAttribute(
          "onmouseenter",
          `showVideoButtons2('show', ${userID})`
        );
        memberFrame.setAttribute(
          "onmouseleave",
          `showVideoButtons2('hide', ${userID})`
        );
        memberFrame.innerHTML = `
        <div class="actions">
            <span><i class="fa-solid fa-phone-slash"></i></span>
            <span><i class="fa-solid fa-video-slash"></i></span>
            <span><i class="fa fa-microphone-lines"></i></span>
            </div>
        `;

        const memberVideo = document.createElement("video");
        memberVideo.muted = true;
        memberVideo.srcObject = stream;
        memberVideo.addEventListener("loadedmetadata", () => {
          memberVideo.play();
        });

        memberFrame.appendChild(memberVideo);
        memberFrames.appendChild(memberFrame);
      }
      isCaller = true;
    })
    .catch((err) => {
      console.log("An error occured: " + err);
    });
});

socket.on("roomJoined", (roomID, userID, username) => {
  roomNumber = roomID;
  navigator.mediaDevices
    .getUserMedia(streamConstraints)
    .then((stream) => {
      localStream = stream;

      if (roomHost === userID) {
        hostVideo.muted = true;
        hostVideo.srcObject = stream;
        hostVideo.addEventListener("loadedmetadata", () => {
          hostVideo.play();
        });
        hostFrame.style.display = "block";
      } else {
        const memberFrame = document.createElement("div");
        memberFrame.classList.add("member-frame");
        memberFrame.setAttribute("id", userID);
        memberFrame.setAttribute(
          "onmouseenter",
          `showVideoButtons2('show', ${userID})`
        );
        memberFrame.setAttribute(
          "onmouseleave",
          `showVideoButtons2('hide', ${userID})`
        );
        memberFrame.innerHTML = `
        <div class="actions">
            <span><i class="fa-solid fa-phone-slash"></i></span>
            <span><i class="fa-solid fa-video-slash"></i></span>
            <span><i class="fa fa-microphone-lines"></i></span>
            </div>
        `;

        const memberVideo = document.createElement("video");
        memberVideo.muted = true;
        memberVideo.srcObject = stream;
        memberVideo.addEventListener("loadedmetadata", () => {
          memberVideo.play();
        });

        memberFrame.appendChild(memberVideo);
        memberFrames.appendChild(memberFrame);
      }

      socket.emit("ready", roomNumber, userID);
    })
    .catch((err) => {
      console.log("An error occured: " + err);
    });
});

socket.on("candidate", (event) => {
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  });
  console.log("Received Candidate: " + candidate);
  pc.addIceCandidate(candidate);
});

socket.on("ready", (roomID, userID) => {
  if (isCaller) {
    pc = new RTCPeerConnection(iceServers);
    pc.onicecandidate = onIceCandidate;
    pc.ontrack = onAddStream;
    pc.addTrack(localStream.getTracks()[0], localStream);
    pc.addTrack(localStream.getTracks()[1], localStream);
    pc.createOffer()
      .then((sessionDescription) => {
        console.log("Sending offer: " + sessionDescription);
        pc.setLocalDescription(sessionDescription);
        socket.emit("offer", {
          type: "offer",
          sdp: sessionDescription,
          roomID: roomID,
          userID: userID,
        });
      })
      .catch((err) => {
        console.log("An error occured: " + err);
      });
    dataChannel = pc.createDataChannel(roomID);
    dataChannel.onmessage = (event) => {
      var details = JSON.parse(event.data);
      const newMessage = document.createElement("div");
      newMessage.classList.add("user-message");
      newMessage.innerHTML = `
                            <div class="pic">
                                <img src="../../../uploads/${details.myAvatar}" alt="">
                            </div>
                            <div class="msg">
                                <em style="margin-right: 10px;"><b>${details.myUsername}</b></em> ${details.message}
                            </div>
                        </div>`;
      document
        .querySelector("#channel-container .bodys")
        .appendChild(newMessage);
      document
        .querySelector("#channel-container2 .bodys")
        .appendChild(newMessage.cloneNode(true));
    };
  }
});

socket.on("offer", (event, userID) => {
  if (!isCaller) {
    pc = new RTCPeerConnection(iceServers);
    pc.onicecandidate = onIceCandidate;
    pc.ontrack = onAddStreamTwo;
    pc.addTrack(localStream.getTracks()[0], localStream);
    pc.addTrack(localStream.getTracks()[1], localStream);
    console.log("Received offer: " + event);
    pc.setRemoteDescription(new RTCSessionDescription(event));
    pc.createAnswer()
      .then((sessionDescription) => {
        console.log("Sending Answer: " + sessionDescription);
        pc.setLocalDescription(sessionDescription);
        socket.emit("answer", {
          type: "answer",
          sdp: sessionDescription,
          roomID: roomNumber,
        });
      })
      .catch((err) => {
        console.log("An error occured: " + err);
      });
    pc.ondatachannel = (event) => {
      dataChannel = event.channel;
      dataChannel.onmessage = (event) => {
        var details = JSON.parse(event.data);
        const newMessage = document.createElement("div");
        newMessage.classList.add("user-message");
        newMessage.innerHTML = `
                            <div class="pic">
                                <img src="../../../uploads/${details.myAvatar}" alt="">
                            </div>
                            <div class="msg">
                                <em style="margin-right: 10px;"><b>${details.myUsername}</b></em> ${details.message}
                            </div>
                        </div>`;
        document
          .querySelector("#channel-container .bodys")
          .appendChild(newMessage);
        document
          .querySelector("#channel-container2 .bodys")
          .appendChild(newMessage.cloneNode(true));
      };
    };
  }
});

socket.on("answer", (event) => {
  console.log("Received answer: " + event);
  pc.setRemoteDescription(new RTCSessionDescription(event));
});

function onAddStream(event) {
  if (roomHost === myID) {
    const memberFrame = document.createElement("div");
    memberFrame.classList.add("member-frame");
    memberFrame.setAttribute("id", myID);
    memberFrame.setAttribute(
      "onmouseenter",
      `showVideoButtons2('show', '${myID}')`
    );
    memberFrame.setAttribute(
      "onmouseleave",
      `showVideoButtons2('hide', '${myID}')`
    );
    memberFrame.innerHTML = `
          <div class="actions">
              <span><i class="fa-solid fa-phone-slash"></i></span>
              <span><i class="fa-solid fa-video-slash"></i></span>
              <span><i class="fa fa-microphone-lines"></i></span>
              </div>
          `;

    const memberVideo = document.createElement("video");
    memberVideo.muted = true;
    memberVideo.srcObject = event.streams[0];
    memberVideo.addEventListener("loadedmetadata", () => {
      memberVideo.play();
    });

    memberFrame.appendChild(memberVideo);
    memberFrames.appendChild(memberFrame);
  } else {
    hostVideo.muted = true;
    hostVideo.srcObject = event.streams[0];
    hostVideo.addEventListener("loadedmetadata", () => {
      hostVideo.play();
    });
    hostFrame.style.display = "block";
  }
  var frameArray = [];
  document.querySelectorAll(".member-frame").forEach((item) => {
    if (item.id === myID) {
      frameArray.push(item);
    }
  });

  for (let i = 1; i < frameArray.length; i++) {
    frameArray[i].remove();
  }

  remoteStream = event.streams[0];
}
