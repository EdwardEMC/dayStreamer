import axios from "axios";

export default {
  //============================================
  // GET REQUESTS
  //============================================
  // verifies the current user
  verify: function() {
    return axios.get("/api/verify");
  },

  // gets all active chats
  getChats: function() {
    return axios.get("/api/chats");
  },

  // gets all messages relating to the active chatbox
  getMessages: function(data) {
    return axios.get("/api/messages/" + data);
  },

  // gets all current map markers
  getOnlineUsers: function() {
    return axios.get("/api/markers");
  },

  // logs out the current user
  logOut: function() {
    return axios.get("/logout");
  },

  //============================================
  // POST REQUESTS
  //============================================

  // checks a user logining in
  loginCheck: function(data) {
    return axios.post("/api/login", data);
  },

  // Saves a new user to the database
  newUser: function(data) {
    return axios.post("/api/register", data); 
  },

   // creates a new chat entry
   newChat: function(data) {
    return axios.post("/api/user/chats", data);
  },

  // Updates the active chats message history
  sendMessage: function(data) {
    // console.log(data, "CLIENT API")
    return axios.post("/api/messages/", data);
  },

  //============================================
  // PUT REQUESTS
  //============================================
  // Updates a user with their online marker
  setOnlineMarker: function(data) {
    return axios.put("/api/user/online", data);
  },
};