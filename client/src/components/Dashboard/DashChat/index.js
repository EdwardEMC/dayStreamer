import React from "react";
import API from "../../utils/API";
// import io from "socket.io-client";
import formatTime from "../../utils/formatTime";
import "./style.css";

const iconPath = process.env.PUBLIC_URL + '/assets/ChatIcons/';

let isAlreadyCalling;
let getCalled = false;
let chatName;
// Shows who is on the other line
// let existingCall;

// For multi-user call
let existingCall = [];

// For dynamic screen generation
let videos;

// Keeping track of notifications
// let messageNotifications;

// Array to hold currently online friends (relates to the offline/online icons)
let onlineFriends = [];
let socket;
// let connected = false;

const { RTCPeerConnection, RTCSessionDescription } = window;

// Need to create a new peerConnection each time a person joins
let peerConnection = new RTCPeerConnection();
let peerConnection1 = new RTCPeerConnection();
// let peerConnection2 = new RTCPeerConnection();
// let peerConnection3 = new RTCPeerConnection();
// let peerConnection4 = new RTCPeerConnection();
// let peerConnection5 = new RTCPeerConnection();
// let peerConnection6 = new RTCPeerConnection();
// let peerConnection7 = new RTCPeerConnection();
// let peerConnection8 = new RTCPeerConnection();
// let peerConnection9 = new RTCPeerConnection();

function DashChat(props) {
  // console.log(props.online, "ONLINE USERS");
  socket = props.socket;

  // If already in a call, show video space
  if(existingCall[0]) {
    document.getElementById("video-space").classList.remove("hide");
  }

  // Updates the user list each time user visits the messenger, incase of missed update-user-list emit
  updateUserList(props.online);

  // Keeping track of notifications
  // let messageNotifications = 0;
  
  // document.getElementById("notification").innerHTML = messageNotifications;
  // document.getElementById("notification").classList.add("hide");
  // user.id for logged in id; user.name for logged in username

  // Initial number of starting screens
  videos = 0;

  const user = JSON.parse(localStorage.getItem("User"));

  //===========================================================================
  // Friends Areas
  //===========================================================================
  API.getChats()
    .then(function(result) {
      createFriendItemContainer(result.data.chats);
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
          // console.log(result, "CHAT MESSAGES");
          displayMessages(result.data);
        })
        .catch(function(err) {
          console.log(err);
        });
      });

      return document.getElementById("friend-user-container").append(userContainerEl);
    });
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
    // let offer;

    console.log(videos, "call");

    if(videos < 2) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

      socket.emit("call-user", {
        offer,
        to: socketId
      });
  
      existingCall.push(socketId);
    }

    // If first line is busy
    if(videos >= 2) {
      const offer = await peerConnection1.createOffer();
      await peerConnection1.setLocalDescription(new RTCSessionDescription(offer));
      
      socket.emit("call-user", {
        offer,
        to: socketId
      });
  
      existingCall.push(socketId);
    }
  }

  function updateUserList(socketIds) {
    // console.log(socketIds, "ONLINE");
    const activeUserContainer = document.getElementById("active-user-container");

    let friendList = [];

    //Making sure the socket doesn't populate the active list if it is a friend
    API.getChats()
    .then(function(result) {
      result.data.chats.map(element => {
        let username = user.name !== element.user1 ? element.user1 : element.user2;
        return friendList.push(username);
      });  
    })
    .then(function() {
      socketIds.forEach(data => {
        // console.log(friendList, "Friendlist");
        // console.log(data, "INSIDE forEach");
        const alreadyExistingUser = document.getElementById(data.name);
        if (!alreadyExistingUser && data.name !== user.name && !friendList.includes(data.name)) {
          const userContainerEl = createUserItemContainer(data);

          activeUserContainer.append(userContainerEl);
        }
        else {
          // Push to onlineFriends array as when refreshing or changing component client side knows whose still online
          // This part still needs work
          if(data.name) {
            onlineFriends.push({name: data.name, socket: data.socket});
            document.getElementById(data.name).setAttribute("value", data.socket);
            document.getElementById(data.name).classList.add(data.socket);
            document.getElementById(data.name + "offline").classList.add("hide");
            document.getElementById(data.name + "online").classList.remove("hide");
          }
        }
      });
    }) // If there's an error, log the error
    .catch(function(err) {
      console.log(err);
    });
  }

  //===========================================================================
  // Socket Connection Area
  //===========================================================================
  // Send data throught the connection (username)
  // Only make one connection when logging in, not on refresh
  // if(!connected) {
  //   socket = io.connect({query: {name: user.name}});
  //   connected = true;
  // }

  // remove any excess chat listeners
  socket.removeListener("chat-message");
  socket.removeListener("chat-sent");

  // not getting called as connection is on app screen
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
    // let answer;

    if (getCalled) {
      let confirmed = window.confirm(
        `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
      );

      if (!confirmed) {
        socket.emit("reject-call", {
          from: data.socket
        });
        return;
      }

      existingCall.push(data.socket);
      let userCalling = document.getElementsByClassName(data.socket)
      let elToFocus = userCalling[0].getAttribute("id");
      // Show video area and call buttons for the receiver
      document.getElementById("video-space").classList.remove("hide");

      unselectUsersFromList();
      document.getElementById(elToFocus).click();
    };
    console.log(videos, "videos");

    // if(videos < 2) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

      socket.emit("make-answer", {
        answer,
        to: data.socket
      });
    // }

    // If first line busy
    // if(videos >= 2) {
    //   await peerConnection1.setRemoteDescription(new RTCSessionDescription(data.offer));
    //   const answer = await peerConnection.createAnswer();

    //   await peerConnection1.setLocalDescription(new RTCSessionDescription(answer));

    //   socket.emit("make-answer", {
    //     answer,
    //     to: data.socket
    //   });
    // }

    videos = videos + 1;

    getCalled = true;
  });

  socket.on("answer-made", async data => {
    console.log(videos, "answer");

    if(videos < 2) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    }

    // If first line busy
    if(videos >= 2) {
      await peerConnection1.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    }

    videos = videos + 1;

    // Only allows one call
    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }
  });

  socket.on("hang-up", () => {
    console.log("here");
    peerConnection.close();

    document.getElementById("video-space").classList.add("hide");
    document.getElementById("chat-panel").classList.remove("hide");

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

  peerConnection.ontrack = function({ streams: [stream] }) {
    console.log("PC");
    const remoteVideo = document.getElementById("remote-video1");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };

  peerConnection1.ontrack = function({ streams: [stream] }) {
    console.log("PC1");
    const remoteVideo = document.getElementById("remote-video2");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };

  navigator.getUserMedia(
    { video: true, audio: true },
    stream => {
      const localVideo = document.getElementById("local-video");
      if (localVideo) {
        localVideo.srcObject = stream;
      }

      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
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
    peerConnection.close();

    existingCall.forEach(call => {
      socket.emit("hang-up", {
        to: call
      });  
    });
    
    document.getElementById("video-space").classList.toggle("hide");
    document.getElementById("chat-panel").classList.remove("hide");

    // Reset the video count to 0
    videos = 0;
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
            {/* collapsible panels */}
            <button onClick={collapse} value="active-user-container" className="panel-title collapsible">Active Users</button>
            <div className="active-users-panel content hide" id="active-user-container">
              {/* area for active chats */}
            </div>
            <button onClick={collapse} value="friend-user-container" className="panel-title collapsible">Conversations</button>
            <div className="friend-users-panel content hide" id="friend-user-container">
              {/* area for friends chats */}
            </div>
            <button onClick={collapse} value="other-user-container" className="panel-title collapsible">Team Chats</button>
            <div className="other-users-panel content hide" id="other-user-container">
              {/* area for others chats */}
            </div>
          </div>
        </div>
      <div id="video-space" className="col-lg panels hide">
        <div className="video-chat-container">
          <div id="video-streams" className="video-container">
            <div className="row no-gutters">
              <video autoPlay className="remote-video" id={"remote-video1"}></video>
              <video autoPlay className="remote-video" id={"remote-video2"}></video>
            </div>
            <video autoPlay muted className="local-video" id="local-video"></video>
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