import React from "react";
import API from "../../utils/API";
import formatTime from "../../utils/formatTime";
import "./style.css";

const iconPath = process.env.PUBLIC_URL + '/assets/ChatIcons/';

let isAlreadyCalling;
let getCalled = false;
let chatName;

let existingCall = []; // For multi-user call
let addingStream; // For adding new group video members

// Keeping track of notifications
// let messageNotifications;

// Array to hold currently online friends (relates to the offline/online icons)
let onlineFriends = [];
let socket;

const { RTCPeerConnection, RTCSessionDescription } = window;

// Limit to only one video box creation (chrome bug triggering twice)
let firstLine = true;
let secondLine = true;

// Need to create a new peerConnection each time a person joins
// let peerConnection = new RTCPeerConnection();
// let peerConnection1 = new RTCPeerConnection();
// let peerConnection2 = new RTCPeerConnection();
// let peerConnection3 = new RTCPeerConnection();
// let peerConnection4 = new RTCPeerConnection();
// let peerConnection5 = new RTCPeerConnection();
// let peerConnection6 = new RTCPeerConnection();
// let peerConnection7 = new RTCPeerConnection();
// let peerConnection8 = new RTCPeerConnection();
// let peerConnection9 = new RTCPeerConnection();

let callers;
// Array to hold peerConnections
let connections = [new RTCPeerConnection(), new RTCPeerConnection()];

function DashChat(props) {
  socket = props.socket;

  if(existingCall[0]) { // If already in a call, show video space
    document.getElementById("video-space").classList.remove("hide");
  }

  // Keeping track of notifications
  // let messageNotifications = 0;
  
  // document.getElementById("notification").innerHTML = messageNotifications;
  // document.getElementById("notification").classList.add("hide");

  // user.id for logged in id; user.name for logged in username
  const user = JSON.parse(localStorage.getItem("User"));

  //===========================================================================
  // Friends Areas
  //===========================================================================
  API.getChats()
    .then(function(result) {
      createFriendItemContainer(result.data.chats);
      // Updates the user list each time user visits the messenger, incase of missed update-user-list emit
      console.log(props.online);
      updateUserList(props.online);
    }) // If there's an error, log the error
    .catch(function(err) {
      console.log(err);
  });

  function createFriendItemContainer(data) {
    data.forEach(element => {
      const name = user.name !== element.user1 ? element.user1 : element.user2;
      const userContainerEl = document.createElement("div");
      const usernameEl = document.createElement("p");

      userContainerEl.setAttribute("class", "active-user ");
      userContainerEl.setAttribute("id", name);
      usernameEl.setAttribute("class", "username");
      usernameEl.innerHTML = `User: ${name}`;

      const offlineEl = document.createElement("img");
      const callButtonEl = document.createElement("img");
  
      let friend = onlineFriends.find(element => element.name === name); // If online show call button

      if(typeof friend !== "undefined" && friend.name === name) {
        userContainerEl.setAttribute("value", friend.socket);
        userContainerEl.classList.add(friend.socket);

        offlineEl.setAttribute("id", name + "offline");
        offlineEl.setAttribute("class", "call-button hide");
        offlineEl.setAttribute("src", iconPath + "offline.png");
        offlineEl.setAttribute("title", "Offline");

        callButtonEl.setAttribute("id", name + "online");
        callButtonEl.setAttribute("class", "call-button");
        callButtonEl.setAttribute("src", iconPath + "online.png");
        callButtonEl.setAttribute("title", "Call");
      } // If offline show offline icon
      else {
        offlineEl.setAttribute("id", name + "offline");
        offlineEl.setAttribute("class", "call-button");
        offlineEl.setAttribute("src", iconPath + "offline.png");
        offlineEl.setAttribute("title", "Offline");
  
        callButtonEl.setAttribute("id", name + "online");
        callButtonEl.setAttribute("class", "call-button hide");
        callButtonEl.setAttribute("src", iconPath + "online.png");
        callButtonEl.setAttribute("title", "Call"); 
      }

      // Add button to delete conversation

      callButtonEl.addEventListener("click", () => {
        isAlreadyCalling = false;
        callUser(document.getElementById(name).getAttribute("value"));
        // Show video area and call buttons for the caller
        document.getElementById("video-space").classList.remove("hide");
        if(existingCall.length >= 1) {
          addingStream = true;
        }
      });

      userContainerEl.append(usernameEl, callButtonEl, offlineEl);

      userContainerEl.addEventListener("click", () => {
        unselectUsersFromList();
        userContainerEl.classList.add("active-user--selected");

        const talkingWithInfo = document.getElementById("talking-with-info");
        talkingWithInfo.setAttribute("value", name);
        // Setting the receiver for chat/video
        talkingWithInfo.innerHTML = `Talking with: "${name}"`;
        
        // Alpha sort the usernames so they are always the same
        const usernames = [name, user.name];
        chatName = usernames.sort().join("-");

        API.getMessages(chatName)
        .then(function(result) {
          displayMessages(result.data);
        })
        .catch(function(err) {
          console.log(err);
        });
      });

      return document.getElementById("friend-user-container").append(userContainerEl);
    });
  }

  function createVideoBox() {
    const videoContainerEl = document.createElement("div");
    const videoEl = document.createElement("video");
    
    videoContainerEl.setAttribute("class", "video-box");
    videoEl.setAttribute("class", "group-video");
    videoEl.setAttribute("id", "remote-video"+ existingCall.length);
    videoEl.autoplay = true;

    videoContainerEl.append(videoEl);
    
    return videoContainerEl;
  }

  function unselectUsersFromList() {
    // clear the message area on active user change
    document.getElementById('messages').innerHTML = "";

    const alreadySelectedUser = document.querySelectorAll(
      ".active-user.active-user--selected"
    );

    alreadySelectedUser.forEach(el => {
      el.classList.remove("active-user--selected");
    });
  }

  function createUserItemContainer(data) {  
    const userContainerEl = document.createElement("div");
    const callButtonEl = document.createElement("img");
    const addFriendEl = document.createElement("img");
    const usernameEl = document.createElement("p");

    userContainerEl.setAttribute("class", "active-user "+ data.socket);
    userContainerEl.setAttribute("id", data.socket);

    addFriendEl.setAttribute("class", "addFriend-button");
    addFriendEl.setAttribute("src", iconPath + "addFriend.png");
    addFriendEl.setAttribute("title", "Start Conversation");

    callButtonEl.setAttribute("class", "call-button");
    callButtonEl.setAttribute("src", iconPath + "online.png");
    callButtonEl.setAttribute("title", "Call");

    usernameEl.setAttribute("class", "username");
    usernameEl.innerHTML = `User: ${data.name}`;

    callButtonEl.addEventListener("click", () => {
      isAlreadyCalling = false;
      callUser(data.socket);
      // Show video area and call buttons for the caller
      document.getElementById("video-space").classList.remove("hide");
      if(existingCall.length >= 1) {
        addingStream = true;
      }
    });

    addFriendEl.addEventListener("click", () => {
      const user = {
        currentUser: data.name
      }

      API.newChat(user)
        .then(function(result) {
          socket.emit("friend-added", {
            name: data.name,
            to: data.socket
          });
          window.location.reload();
        })
        .catch(function(err) {
          console.log(err);
        })
    });

    userContainerEl.append(usernameEl, callButtonEl, addFriendEl);

    userContainerEl.addEventListener("click", () => {
      unselectUsersFromList();
      userContainerEl.classList.add("active-user--selected");

      const talkingWithInfo = document.getElementById("talking-with-info");
      talkingWithInfo.setAttribute("value", data.socket);
      talkingWithInfo.innerHTML = `Talking with: ${data.name}`;
    });

    return userContainerEl;
  }

  // function to display results in message area
  function displayMessages(data) {
    // change to display past x messsages and then add a button to view more
    const area = document.getElementById('messages');

    data.messages.map(element => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      
      span.setAttribute("title", formatTime(element.createdAt));
      span.innerHTML = element.message;

      if(element.userId === data.id) {
        li.setAttribute("class", "current");
        span.setAttribute("class", "sent");
      }
      else {
        li.setAttribute("class", "other");
        span.setAttribute("class", "received");
      }
      li.append(span);
      
      return area.append(li);
    });
  
    let objDiv = document.getElementById("message-scroll");
    objDiv.scrollTop = objDiv.scrollHeight;
  };

  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  // Calling Area
  //===========================================================================
  //https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/multiple/js/main.js

  async function callUser(socketId) {
    // After creating dynamic variable set it to = new RTCPeerConnection();
    // Can create a new peer connection at a increase dynamic variable each time someone is called concurrently
    // Emit an addToStream socket on call accept to other users in current call
    console.log(existingCall, "BEFORE");
    if(!existingCall.includes(socketId)) {
      existingCall.push(socketId);
    }
    console.log(existingCall, "AFTER");

    callers = existingCall.length -1;

    console.log(callers, "CALLERS");

    if(existingCall.length >= 1) {
      let offer = await connections[callers].createOffer();
      await connections[callers].setLocalDescription(new RTCSessionDescription(offer));

      socket.emit("call-user", {
        offer,
        to: socketId
      });
    }

    // If first line is busy
    // if(existingCall.length === 2) {
    //   let offer = await peerConnection1.createOffer();
    //   await peerConnection1.setLocalDescription(new RTCSessionDescription(offer));
      
    //   socket.emit("call-user", {
    //     offer,
    //     to: socketId
    //   });
    // }
  }

  function updateUserList(socketIds) {
    const activeUserContainer = document.getElementById("active-user-container");

    socketIds.forEach(data => {
      const alreadyExistingUser = document.getElementById(data.name);
      if (alreadyExistingUser) {
        onlineFriends.push({name: data.name, socket: data.socket});
        document.getElementById(data.name).setAttribute("value", data.socket);
        document.getElementById(data.name).classList.add(data.socket);
        document.getElementById(data.name + "offline").classList.add("hide");
        document.getElementById(data.name + "online").classList.remove("hide");
      }
      else if(data.name !== user.name){
        const userContainerEl = createUserItemContainer(data);
        activeUserContainer.append(userContainerEl);
      }
    });
  }

  //===========================================================================
  // Socket Area
  //===========================================================================
  // remove any excess chat listeners
  socket.removeListener("chat-message");
  socket.removeListener("chat-sent");

  socket.on("update-user-list", ({ users }) => {
    // if on friends list show on chat area
    updateUserList(users);
  });

  socket.on("friend-request", () => {
    // Change this later to just a function refresh
    window.location.reload();
  });

  socket.on("remove-user", ({ socketId }) => {
    let elToRemove;
    let frToRemove;
    let friend = onlineFriends.find(element => element.socket === socketId);

    // Determine if a friend is
    if(document.getElementById(socketId)) {
      elToRemove = document.getElementById(socketId);
    }
    else if(typeof friend !== "undefined"){
      frToRemove = document.getElementById(friend.name);
    }

    if(elToRemove) {
      elToRemove.remove();
    }
    else if(frToRemove) {
      // If online show call button
      frToRemove.classList.remove(socketId);
      frToRemove.setAttribute("value", "");
      document.getElementById(friend.name + "offline").classList.remove("hide");
      document.getElementById(friend.name + "online").classList.add("hide");
      //Filter out friend from onlineFriends
      onlineFriends = onlineFriends.filter(element => {
        return element.socket !== socketId
      });
    };
  });

  socket.on("call-made", async data => {
    if(!existingCall.includes(data.socket)) {
      existingCall.push(data.socket);
    }

    callers = existingCall.length -1;

    if (getCalled) {
      // Only confirm for first caller, other group members added freely
      // if(existingCall.length === 1) {
        let confirmed = window.confirm(
          `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
        );

        if (!confirmed) {
          socket.emit("reject-call", {
            from: data.socket
          });

          let index = existingCall.indexOf(data.socket);
          existingCall.splice(index, 1);

          return;
        }
      // }

      // let userCalling = document.getElementsByClassName(data.socket)
      // let elToFocus = userCalling[0].getAttribute("id");
      // Show video area and call buttons for the receiver
      document.getElementById("video-space").classList.remove("hide");

      // unselectUsersFromList();
      // document.getElementById(elToFocus).click();
      getCalled = false;
    }
    else {
      getCalled = true;
    }

    console.log(existingCall);
    console.log(existingCall.length, "NUMBER OF CALLERS");

    if(existingCall.length >= 1) {
      await connections[callers].setRemoteDescription(new RTCSessionDescription(data.offer));
      let answer = await connections[callers].createAnswer();

      await connections[callers].setLocalDescription(new RTCSessionDescription(answer));

      console.log(connections[callers], "Other User");

      socket.emit("make-answer", {
        answer,
        to: data.socket
      });
    }

    // If first line busy
    // if(existingCall.length === 2) {
    //   await peerConnection1.setRemoteDescription(new RTCSessionDescription(data.offer));
    //   let answer = await peerConnection1.createAnswer();

    //   await peerConnection1.setLocalDescription(new RTCSessionDescription(answer));

    //   console.log(peerConnection1, "Other User");
      
    //   socket.emit("make-answer", {
    //     answer,
    //     to: data.socket
    //   });
    // }
  });

  socket.on("answer-made", async data => {
    if(existingCall.length >= 1) {
      console.log(connections[callers], "PC");
      await connections[callers].setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    }

    // If first line busy
    // if(existingCall.length === 2) {
    //   console.log(peerConnection1, "PC1");
    //   await peerConnection1.setRemoteDescription(
    //     new RTCSessionDescription(data.answer)
    //   );
    // }

    // Only allows one call
    if (!isAlreadyCalling) {
      callUser(data.socket);
      // callers += 1;
      isAlreadyCalling = true;
    }

    if(addingStream) {
      let others = existingCall.filter(element => element !== data.socket);
      socket.emit("new-to-stream", {
        to: others,
        newStream: data.socket
      });

      addingStream = false;
    }
  });

  socket.on("add-to-stream", data => {
    console.log("FOR PEOPLE ALREADY IN STREAM AND NEED TO CONNECT TO NEW MEMBER");
    console.log(data, "ADDED TO STREAM");

    isAlreadyCalling = false;
    addingStream = false;
    // Working up to here (data.new is the socket of the newest person added to the primary call)
    // Make the other users call the new member (add auto-accept)
    // Need a break between connection current member to primary and new member to everyone else
    // callUser(data.new);
  });

  socket.on("hang-up", () => {
    // Filter through existingCall array and remove the person who hung up
    // console.log("here");
    connections[callers].close();

    document.getElementById("video-space").classList.add("hide");
    document.getElementById("chat-panel").classList.remove("hide");

    firstLine = true;
    // secondLine = true;

    window.location.reload();
  });

  socket.on("call-rejected", data => {
    alert(`User: "Socket: ${data.socket}" rejected your call.`);

    let index = existingCall.indexOf(data.socket);
    existingCall.splice(index, 1);

    unselectUsersFromList();
    // Hide video area and call buttons for the caller
    document.getElementById("video-space").classList.add("hide");
  });

  // Socket for message notification
  socket.on("message-notification", data => {
    // If on chats detect which conversation to update
    // Add area on chat boxes for notifications
    // if(window.location.pathname === "/chats") {
    //   let name = document.getElementById(data.from);
    //   messageNotifications + 1, "message received";
    //   name.inn
    // }

    // else if detect the use is on the chats page
    // if(window.location.pathname !== "/chats") {
    //   let notify = document.getElementById("notification");
    //   notify.innerHTML = "!";
    //   notify.classList.remove("hide");
    // }
  });

  connections[0].ontrack = function({ streams: [stream] }) {
    console.log("PC");
    if(firstLine) {
      const videoContainerEL = createVideoBox();
      document.getElementById("video-boxes").append(videoContainerEL);
    }
    firstLine = false;

    const remoteVideo = document.getElementById("remote-video1");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };

  connections[1].ontrack = function({ streams: [stream] }) {
    console.log("PC");
    if(secondLine) {
      const videoContainerEL = createVideoBox();
      document.getElementById("video-boxes").append(videoContainerEL);
    }
    secondLine = false;

    const remoteVideo = document.getElementById("remote-video2");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };

  // peerConnection1.ontrack = function({ streams: [stream] }) {
  //   console.log("PC1");
  //   if(secondLine) {
  //     const videoContainerEL = createVideoBox();
  //     document.getElementById("video-boxes").append(videoContainerEL);
  //   }
  //   secondLine = false;

  //   const remoteVideo = document.getElementById("remote-video2");
  //   if (remoteVideo) {
  //     remoteVideo.srcObject = stream;
  //   }
  // };

  navigator.getUserMedia(
    { video: true, audio: true },
    stream => {
      const localVideo = document.getElementById("local-video");
      if (localVideo) {
        localVideo.srcObject = stream;
      }

      // Need to add streams for each new call
      stream.getTracks().forEach(track => connections[0].addTrack(track, stream));
      stream.getTracks().forEach(track => connections[1].addTrack(track, stream));
      // stream.getTracks().forEach(track => peerConnection1.addTrack(track, stream));
    },
    error => {
      console.warn(error.message);
    }
  );

  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  //===========================================================================
  // Messaging Area
  //===========================================================================
  function messageDisplay(data) {
    const area = document.getElementById('messages');
    const li = document.createElement('li');
    const span = document.createElement('span');
    
    span.setAttribute("title", formatTime(data.time));
    span.innerHTML = data.message;

    if(data.fromId === user.id) {
      li.setAttribute("class", "current");
      span.setAttribute("class", "sent");
    }
    else {
      li.setAttribute("class", "other");
      span.setAttribute("class", "received");
    }
    li.append(span);
    
    return area.append(li);
  }

  socket.on("chat-sent", data => {
    let active;
    let name;

    if(document.getElementById("talking-with-info")) {
      name = document.getElementById("talking-with-info").getAttribute("value");
    }
    if(name) {
      active = document.getElementById(name).getAttribute("value");
    }

    if(active === data.socket) {
      messageDisplay(data.msg);
      let objDiv = document.getElementById("message-scroll");
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  });

  function sendMessage(event) {
    event.preventDefault();

    const data = {
      message: document.getElementById('m').value,
      chatname: chatName
    }

    //Detect if user has clicked on a chat box and if not return
    if(document.getElementById("talking-with-info").innerHTML === "Select a user.") {
      console.log("No chatboxes selected");
      document.getElementById('m').value='';
      return;
    }

    let name = document.getElementById("talking-with-info").getAttribute("value");
    let receiver = document.getElementById(name).getAttribute("value");

    API.sendMessage(data)
    .then(function(result) {
      console.log("success");
    })
    .catch(function(err) {
      console.log(err);
    });

    let msg = {
      message: document.getElementById('m').value,
      time: new Date(),
      socket: socket.id,
      fromName: user.name,
      fromId: user.id,
      to: receiver
    }

    // socket emit
    socket.emit("chat-message", msg);

    messageDisplay(msg);

    let objDiv = document.getElementById("message-scroll");
    objDiv.scrollTop = objDiv.scrollHeight;

    document.getElementById('m').value='';
  }

  //===========================================================================
  // Screen manupulation Area
  //===========================================================================
  function userarea() {
    document.getElementById("user-panel").classList.toggle("hide");
  }

  function chatarea() {
    document.getElementById("chat-panel").classList.toggle("hide");
  };

  function hangup() {
    connections[0].close();

    existingCall.forEach(call => {
      socket.emit("hang-up", {
        to: call
      });  
    });
    
    document.getElementById("video-space").classList.toggle("hide");
    document.getElementById("chat-panel").classList.remove("hide");

    firstLine = true;
    // secondLine = true;

    window.location.reload();
  }

  function collapse(event) {
    document.getElementById(event.target.value).classList.toggle("hide");
  }

  return (
    <div className="row no-gutters">
      <div id="user-panel" className="col-lg-3">
        <h2 id="talking-with-info" className="talk-info text-center">
          Select a user.
        </h2>
        <div id="user-list-panel">
          <button onClick={collapse} value="active-user-container" className="panel-title collapsible">Active Users</button>
          <div className="active-users-panel content" id="active-user-container">
            {/* area for active chats */}
          </div>
          <button onClick={collapse} value="friend-user-container" className="panel-title collapsible">Conversations</button>
          <div className="friend-users-panel content" id="friend-user-container">
            {/* area for friends chats */}
          </div>
          <button onClick={collapse} value="other-user-container" className="panel-title collapsible">Team Chats</button>
          <div className="other-users-panel content" id="other-user-container">
            {/* area for others chats */}
          </div>
        </div>
      </div>
      <div id="video-space" className="col-lg panels hide">
        <div className="video-chat-container">
          <div id="video-streams" className="video-container">
            <div id="video-boxes">
              <div className="video-box">
                <video autoPlay muted className="local-video" id="local-video"></video>
              </div>
            </div>
            {/* Video below for one to one calls only */}
            {/* <video autoPlay muted className="local-video-single hide" id="local-video"></video> */}
            <div id="options">
              <div id="call-buttons" className="button-container">  
                <button onClick={hangup} className="btn btn-danger">Hang Up</button>
                <button onClick={userarea} className="button-container btn btn-dark">User List</button>
                <button onClick={chatarea} className="btn btn-info">Show Chat</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="chat-panel" className="col-lg panels">
        <div className="main-chat-area">
          <div id="message-scroll" className="display-area">
            <ul id="messages">
            </ul> 
          </div>
          <div id="send-area" className="send">
           <form className="form-horizontal sendArea" id="form" action="" onSubmit={sendMessage}>
             <input id="m" autoComplete="off" className="inputColor"/>
             <button id="sendButton" className="btn btn-primary" type="submit">Send</button>
           </form>
         </div>
        </div>
      </div>
    </div>
  );
};

export default DashChat;