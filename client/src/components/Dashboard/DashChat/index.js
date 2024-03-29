import React from "react";
import API from "../../utils/API";
import formatTime from "../../utils/formatTime";
// import { useHistory } from "react-router-dom";
import "./style.css";

//https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/multiple/js/main.js

const iconPath = process.env.PUBLIC_URL + '/assets/ChatIcons/';
const { RTCPeerConnection, RTCSessionDescription } = window;

let isAlreadyCalling;

let getCalled = false;

let chatName;

let existingCall = []; // For multi-user call

let addingStream; // For adding new group video members

let onCall = false; // If anyone tries to call while user is already in call

let add = false;

//let messageNotifications; // Keeping track of notifications
let onlineFriends = []; // Array to hold currently online friends

let socket;

let busyLine = true; // Limit to only one video box creation

let connections = [{id:0, connection:new RTCPeerConnection()}]; // Array to hold peerConnections

let callers = 0;

function DashChat(props) {
  // Passed down from APP.js so users online as soon as they log in
  socket = props.socket;

  // let history = useHistory();

  if(existingCall[0]) { // If already in a call, show video space
    document.getElementById("video-space").classList.remove("hide");
  }

  // Keeping track of notifications
  // let messageNotifications = 0;
  
  // document.getElementById("notification").innerHTML = messageNotifications;
  // document.getElementById("notification").classList.add("hide");

  // user.id for logged in id; user.name for logged in username
  const user = JSON.parse(localStorage.getItem("User"));

  localStream();
  //===========================================================================
  // Friends Areas
  //===========================================================================
  API.getChats()
    .then(function(result) {
      createFriendItemContainer(result.data.chats);
      // Updates the user list each time user visits the messenger, incase of missed update-user-list emit
      // console.log(props.online);
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
  // Calling Area
  //===========================================================================
  async function callUser(socketId, added) {
    if(!existingCall.includes(socketId)) {
      existingCall.push(socketId);
      connections.push({id:1, connection:new RTCPeerConnection()});
      localStream();
    }

    callers = existingCall.length -1;

    if(existingCall.length >= 1) {
      let offer = await connections[callers].connection.createOffer();
      await connections[callers].connection.setLocalDescription(new RTCSessionDescription(offer));

      socket.emit("call-user", {
        offer,
        to: socketId,
        from: user.name,
        added: added
      });

      onCall = true;
    }
  }

  function updateUserList(socketIds) {
    const activeUserContainer = document.getElementById("active-user-container");

    socketIds.forEach(data => {
      const alreadyExistingFriend = document.getElementById(data.name);
      const alreadyExistingUser = document.getElementById(data.socket);
      if (alreadyExistingFriend) {
        onlineFriends.push({name: data.name, socket: data.socket});
        document.getElementById(data.name).setAttribute("value", data.socket);
        document.getElementById(data.name).classList.add(data.socket);
        document.getElementById(data.name + "offline").classList.add("hide");
        document.getElementById(data.name + "online").classList.remove("hide");
      }
      else if(data.name !== user.name && !alreadyExistingUser){
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

  // New user logging on update
  socket.on("update-user-list", ({ users }) => {
    // if on friends list show on chat area
    updateUserList(users);
  });

  // Start a conversation
  socket.on("friend-request", () => {
    // Change this later to just a function refresh
    window.location.reload();
  });

  // User logging off
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

  // User being called
  socket.on("call-made", async data => {
    // push only if no on page
    // let sitePage = window.location.href;
    // console.log(sitePage);

    // // Error on connection if accepted on different page
    // // Still works regardless of error above
    // if(!sitePage.includes("/chat")) {
    //   console.log("push chat page");
    //   history.push("/chat");
    // }
    
    console.log(onCall, "ONCALL");
    console.log(data.added, "ADDED");

    // If user is on call and user calling is not adding to stream reject incoming
    if(onCall && !data.added && !add) {
      socket.emit("reject-call", {
        from: data.socket,
        inCall: true
      });
      console.log("inside call reject addon stream");
      return;
    }

    data.added ? add = true : add = false;

    if(!existingCall.includes(data.socket)) {
      existingCall.push(data.socket);
      connections.push({id:existingCall.length, connection:new RTCPeerConnection()});
      localStream();
    }

    callers = existingCall.length -1;

    if (getCalled) {
      if(existingCall.length === 1) { // Only confirm for first caller, other group members added freely
        let confirmed = window.confirm(
          `User "Socket: ${data.from}" wants to call you. Do accept this call?`
        );

        if (!confirmed) {
          socket.emit("reject-call", {
            from: {
              socket:data.socket, 
              name:user
            }
          });

          let index = existingCall.indexOf(data.socket);
          existingCall.splice(index, 1);

          connections.pop();

          return;
        }
      }

      // let userCalling = document.getElementsByClassName(data.socket)
      // let elToFocus = userCalling[0].getAttribute("id");
      // Show video area and call buttons for the receiver
      document.getElementById("video-space").classList.remove("hide");

      // unselectUsersFromList();
      // document.getElementById(elToFocus).click();
      getCalled = false;
      onCall = true;
    }
    else {
      getCalled = true;
    }

    getTracks();

    if(existingCall.length >= 1) {
      await connections[callers].connection.setRemoteDescription(new RTCSessionDescription(data.offer));
      let answer = await connections[callers].connection.createAnswer();

      await connections[callers].connection.setLocalDescription(new RTCSessionDescription(answer));

      console.log(connections[callers].connection, "Other User");

      socket.emit("make-answer", {
        answer,
        to: data.socket
      });
    }
  });

  socket.on("answer-made", async data => {
    if(existingCall.length >= 1) {
      console.log(connections[callers].connection, "PC");
      getTracks();
      await connections[callers].connection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    }

    // As chrome runs it twice, dont emit second time only first
    if(addingStream && isAlreadyCalling) { // Sends an emit if there is more than one other user on call
      console.log("here");
      let others = existingCall.filter(element => element !== data.socket);
      socket.emit("new-to-stream", {
        to: others,
        newStream: data.socket,
        added: true
      });

      addingStream = false;
    }

    if (!isAlreadyCalling) { // Only allows one call (chrome bug?)
      callUser(data.socket);
      isAlreadyCalling = true;
    }
  });

  socket.on("add-to-stream", data => {
    console.log(data, "ADDED TO STREAM");

    isAlreadyCalling = false;
    addingStream = false;
    
    // Need to delay for the first person to accept. Then call with other users
    setTimeout(function() {
      callUser(data.new, data.added);
    }, data.time);
  });

  socket.on("hang-up", data => {
    console.log(data.from);
    let index = existingCall.indexOf(data.from);
  
    if(connections[index]) {
      connections[index].connection.close();
      document.getElementById("remote-video" + (index+1)).classList.add("hide"); // Remove the video box of user hanging up
    }
    

    onCall = false;

    if(existingCall.length === 1) {
      document.getElementById("video-space").classList.add("hide");
      document.getElementById("chat-panel").classList.remove("hide");

      // replace this later on
      window.location.reload();
    }
  });

  socket.on("call-rejected", data => {
    if(data.inCall) {
      alert(`User: "Socket: ${data.from}" is current on a call.`);
    }
    else {
      alert(`User: "Socket: ${data.from}" rejected your call.`); 
    }

    let index = existingCall.indexOf(data.socket);
    existingCall.splice(index, 1);

    connections.pop();

    onCall = false;

    unselectUsersFromList();
    // Hide video area and call buttons for the caller
    document.getElementById("video-space").classList.add("hide");
  });

  // // Socket for message notification
  // socket.on("message-notification", data => {
  //   // If on chats detect which conversation to update
  //   // Add area on chat boxes for notifications
  //   console.log(window.location.pathname);
  //   if(window.location.pathname === "/chats") {
  //     let name = document.getElementById(data.fromName);
  //     let socket = document.getElementById(data.socket);
  //     if(name) {
  //       messageNotifications += 1 
  //       console.log("message received NAME");
  //       // name.innerHTML = messageNotifications
  //     }
  //     else if(socket) {
  //       messageNotifications += 1
  //       console.log("message received SOCKET");
  //       // socket.innerHTML = messageNotifications
  //     }
  //   }

  //   // else if detect the use is on the chats page
  //   if(window.location.pathname !== "/chats") {
  //     let notify = document.getElementById("notification");
  //     notify.innerHTML = "!";
  //     notify.classList.remove("hide");
  //   }
  // });

  // Functions for receiving streams local and remote
  function getTracks() {
    connections[callers].connection.ontrack = function({ streams: [stream] }) {
      console.log("PC");
      if(busyLine) {
        const videoContainerEL = createVideoBox();
        document.getElementById("video-boxes").append(videoContainerEL);
        busyLine = false;
      }
      else {
        busyLine = true;
      }

      const remoteVideo = document.getElementById("remote-video" + existingCall.length);
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
      }
    };
  }

  function localStream() {
    navigator.getUserMedia = ( navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia ||
      navigator.mediaDevices.getUserMedia
    );

    // firefox updated navigator.mediaDevices.getUserMedia

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(
        stream => {
          const localVideo = document.getElementById("local-video");
          if (localVideo) {
            localVideo.srcObject = stream;
          }

          getStreams(stream);  
        },
        error => {
          console.warn(error.message);
        }
      )
      .catch(err => console.log(err));
  }

  function getStreams(stream) {
    stream.getTracks().forEach(track => connections[connections.length - 1].connection.addTrack(track, stream));
  }

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
    
    console.log("here");
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
    connections[0].connection.close();

    existingCall.forEach(call => {
      socket.emit("hang-up", {
        to: call
      });  
    });

    existingCall = [];

    onCall = false;
    
    document.getElementById("video-space").classList.toggle("hide");
    document.getElementById("chat-panel").classList.remove("hide");

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