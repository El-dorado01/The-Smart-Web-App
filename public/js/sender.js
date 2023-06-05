/*
-- Send userID

*/

var socket = io();

socket.on("answer", (response) => {
  peerConnection.setRemoteDescription = response.answer;
});
socket.on("candidate", (response) => {
  peerConnection.addIceCandidate = response.candidate;
});

var localStream;
var peerConnection;
function startRoomMeeting(roomID, userID) {
  socket.emit("userData", { roomID, userID });
  //Emit userID and roomID to the server
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
        socket.emit("store_candidate", e.candidate);
      });
      createAndSendOffer();
    });
  console.log(roomID, userID);
}

function createAndSendOffer() {
  peerConnection.createOffer(
    (offer) => {
      //Send offer
      socket.emit("send_offer", offer);

      peerConnection.setLocalDescription(offer);
    },
    (error) => {
      console.log(error);
    }
  );
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
