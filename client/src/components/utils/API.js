import axios from "axios";

export default {
  //============================================
  // GET REQUESTS
  //============================================
  // verifies the current user
  verify: function() {
    return axios.get("/api/verify");
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
  }
};