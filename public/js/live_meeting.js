const APP_ID = "28ee674469644c95adb4530ae5db596b";

let uid = myID;
let displayName = myUsername;
let avatar = myAvatar;
let capacity = roomCapacity;

let token = null;
let client;

let rtmClient;
let channel;

let roomId = verifiedRoomID;

let localTracks = [];
let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;

const displayFrame = document.querySelector(".host-frame");
const memberFrames = document.querySelector(".member-frames");
let videoFrames = document.getElementsByClassName("member-frame");
let userIdInDisplayFrame = null;

let joinRoomInit = async () => {
  rtmClient = await AgoraRTM.createInstance(APP_ID);
  await rtmClient.login({ uid, token });

  await rtmClient.addOrUpdateLocalUserAttributes({ name: displayName, avatar });

  channel = await rtmClient.createChannel(roomId);
  await channel.join();

  let members = await channel.getMembers();
  if (capacity != "unlimited") {
    if (members.length >= parseInt(capacity)) {
      //Room Full
      window.location.href = "/dashboard/private/live_meeting/roomFull";
      exit();
    }
  }

  channel.on("MemberJoined", handleMemberJoined);
  channel.on("MemberLeft", handleMemberLeft);
  channel.on("ChannelMessage", handleChannelMessage);

  getMembers();
  addBotMessageToDom(`${displayName} has joined the room!`, displayName, uid);

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await client.join(APP_ID, roomId, token, uid);

  joinStream();

  client.on("user-published", handleUserPublished);
  client.on("user-left", handleUserLeft);
};

let joinStream = async () => {
  localTracks = await AgoraRTC
    .createMicrophoneAndCameraTracks
    // {},
    // {
    //   encoderConfig: {
    //     width: { min: 640, ideal: 1920, max: 1920 },
    //     height: { min: 480, ideal: 1080, max: 1080 },
    //   },
    // }
    ();

  let player = `<div class="member-frame" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`;

  memberFrames.insertAdjacentHTML("beforeend", player);
  document
    .getElementById(`user-container-${uid}`)
    .addEventListener("click", expandVideoFrame);

  localTracks[1].play(`user-${uid}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

let switchToCamera = async () => {
  let player = `<div class="member-frame" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`;
  displayFrame.insertAdjacentHTML("beforeend", player);

  await localTracks[0].setMuted(true);
  await localTracks[1].setMuted(true);

  document.getElementById("mic-btn").classList.remove("active");
  document.getElementById("screen-btn").classList.remove("active");

  localTracks[1].play(`user-${uid}`);
  await client.publish([localTracks[1]]);
};

let handleMemberJoined = async (MemberId) => {
  console.log("A new member has joined the room:", MemberId);
  addMemberToDom(MemberId);

  let members = await channel.getMembers();
  updateMemberTotal(members);

  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);
  addBotMessageToDom(`${name} has joined the room!`, name, MemberId);
};

let addMemberToDom = async (MemberId) => {
  let { name, avatar } = await rtmClient.getUserAttributesByKeys(MemberId, [
    "name",
    "avatar",
  ]);

  let membersWrapper = document.getElementById("channel-participants");
  let membersWrapper2 = document.getElementById("channel-participants1");
  let memberItem = `<div class="participant" id="member__${MemberId}__wrapper">
                        <div class="pic">
                            <img src="../../../uploads/${avatar}" alt="">
                        </div>
                        <div class="msg">
                            ${name}
                        </div>
                    </div>`;
  let memberItem2 = `<div class="participant" id="member__${MemberId}__wrapper2">
                        <div class="pic">
                            <img src="../../../uploads/${avatar}" alt="">
                        </div>
                        <div class="msg">
                            ${name}
                        </div>
                    </div>`;

  membersWrapper.insertAdjacentHTML("beforeend", memberItem);
  membersWrapper2.insertAdjacentHTML("beforeend", memberItem2);
};

let updateMemberTotal = async (members) => {
  let total = document.getElementById("msg-archive1");
  let total2 = document.getElementById("msg-archive2");
  total.innerText = members.length;
  total2.innerText = members.length;
};

let handleMemberLeft = async (MemberId) => {
  removeMemberFromDom(MemberId);

  let members = await channel.getMembers();
  updateMemberTotal(members);
};

let getMembers = async () => {
  let members = await channel.getMembers();
  updateMemberTotal(members);
  for (let i = 0; members.length > i; i++) {
    addMemberToDom(members[i]);
  }
};

let handleChannelMessage = async (messageData, MemberId) => {
  let data = JSON.parse(messageData.text);

  if (data.type === "chat") {
    addMessageToDom(data.displayName, data.avatar, data.message);
  }

  if (data.type === "user_left") {
    document.getElementById(`user-container-${data.uid}`).remove();

    if (userIdInDisplayFrame === `user-container-${uid}`) {
      displayFrame.style.display = null;

      for (let i = 0; videoFrames.length > i; i++) {
        videoFrames[i].style.height = "300px";
        videoFrames[i].style.width = "300px";
      }
    }
  }
};

let sendChannelMessage = async () => {
  const message = document.getElementById("channel_message").value;
  channel.sendMessage({
    text: JSON.stringify({
      type: "chat",
      message: message,
      displayName: displayName,
      avatar,
    }),
  });
  addMessageToDom(displayName, avatar, message);
  document.getElementById("channel_message").value = "";
};

let sendChannelMessage2 = async () => {
  const message = document.getElementById("channel_message2").value;
  channel.sendMessage({
    text: JSON.stringify({
      type: "chat",
      message: message,
      displayName: displayName,
      avatar,
    }),
  });
  addMessageToDom(displayName, avatar, message);
  document.getElementById("channel_message2").value = "";
};

let addMessageToDom = (name, avatar, message) => {
  let messagesWrapper = document.querySelector("#channel-container .bodys");
  let messagesWrapper2 = document.querySelector("#channel-container1 .bodys");

  let newMessage = `<div class="user-message">
                        <div class="pic">
                            <img src="../../../uploads/${avatar}" alt="">
                        </div>
                        <div class="msg">
                            <em style="margin-right: 10px;"><b>${name}</b></em> ${message}
                        </div>
                    </div>`;

  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);
  messagesWrapper2.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(
    "#channel-container .bodys .user-message:last-child"
  );
  let lastMessage2 = document.querySelector(
    "#channel-container1 .bodys .user-message:last-child"
  );
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
  if (lastMessage2) {
    lastMessage2.scrollIntoView();
  }
};

let addBotMessageToDom = (botMessage, name, userId) => {
  let messagesWrapper = document.querySelector("#channel-container .bodys");
  let messagesWrapper2 = document.querySelector("#channel-container1 .bodys");

  let newMessage = `<div class="bot-message" id="botMsg_${userId}">
                        <p class="myName" style="display: none;">${name}</p>
                        <p><i class="fas fa-robot"></i> <span>Smart Bot</span></p>
                        <p>${botMessage}</p>
                    </div>`;

  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);
  messagesWrapper2.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(
    "#channel-container .bodys .user-message:last-child"
  );
  let lastMessage2 = document.querySelector(
    "#channel-container1 .bodys .user-message:last-child"
  );
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
  if (lastMessage2) {
    lastMessage2.scrollIntoView();
  }
};

let removeMemberFromDom = async (MemberId) => {
  let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
  let memberWrapper2 = document.getElementById(`member__${MemberId}__wrapper2`);
  let name = document.querySelector(`#botMsg_${MemberId} .myName`).textContent;
  addBotMessageToDom(`${name} has left the room.`, name, MemberId);

  memberWrapper.remove();
  memberWrapper2.remove();
};

let handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  await client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);
  if (player === null) {
    player = `<div class="member-frame" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
            </div>`;

    memberFrames.insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${user.uid}`)
      .addEventListener("click", expandVideoFrame);
  }

  if (mediaType === "video") {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  let item = document.getElementById(`user-container-${user.uid}`);
  if (item) {
    item.remove();
  }

  if (userIdInDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.style.display = null;

    let videoFrames = document.getElementsByClassName("member-frame");
  }
};

let expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) {
    memberFrames.appendChild(child);
  }

  displayFrame.style.display = "block";
  displayFrame.appendChild(e.currentTarget);
  userIdInDisplayFrame = e.currentTarget.id;
};

for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener("click", expandVideoFrame);
}

let hideDisplayFrame = () => {
  userIdInDisplayFrame = null;
  displayFrame.style.display = null;

  let child = displayFrame.children[0];
  memberFrames.appendChild(child);
};

let toggleMic = async (e) => {
  let button = e.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    button.classList.add("active");
  } else {
    await localTracks[0].setMuted(true);
    button.classList.remove("active");
  }
};

let toggleCamera = async (e) => {
  let button = e.currentTarget;

  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    button.classList.add("active");
  } else {
    await localTracks[1].setMuted(true);
    button.classList.remove("active");
  }
};

let toggleScreen = async (e) => {
  let screenButton = e.currentTarget;
  let cameraButton = document.getElementById("camera-btn");

  if (!sharingScreen) {
    sharingScreen = true;

    screenButton.classList.add("active");
    cameraButton.classList.remove("active");
    cameraButton.style.display = "none";

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`user-container-${uid}`).remove();
    displayFrame.style.display = "block";

    let player = `<div class="member-frame" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`;

    displayFrame.insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${uid}`)
      .addEventListener("click", expandVideoFrame);

    userIdInDisplayFrame = `user-container-${uid}`;
    localScreenTracks.play(`user-${uid}`);

    await client.unpublish([localTracks[1]]);
    await client.publish([localScreenTracks]);
  } else {
    sharingScreen = false;
    cameraButton.style.display = "flex";
    document.getElementById(`user-container-${uid}`).remove();
    await client.unpublish([localScreenTracks]);

    switchToCamera();
  }
};

let leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

let leaveRoom = async () => {
  window.location.href = "/dashboard/private/live_meeting";
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("screen-btn").addEventListener("click", toggleScreen);
displayFrame.addEventListener("click", hideDisplayFrame);
window.addEventListener("beforeunload", leaveChannel);

joinRoomInit();
