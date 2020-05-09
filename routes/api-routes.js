const db = require("../models");
const { Op } = require("sequelize");
const passport = require("../config/passport");

// Authentication funciton
// const isAuth = require("../config/middleware/isAuth");
// const isReg = require("../config/middleware/isReg");

module.exports = function(app) {
  // route to return a list of all users
  app.get("/api/user", function(req, res) {
    db.User.findAll({ }).then(function(dbUser) {
      res.json(dbUser);
    });
  });
};