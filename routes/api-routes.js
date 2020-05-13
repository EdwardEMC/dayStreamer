const db = require("../models");
const { Op } = require("sequelize");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../config/middleware/isAuth");

// Authentication funciton
// const isAuth = require("../config/middleware/isAuth");
// const isReg = require("../config/middleware/isReg");

module.exports = function(app) {
  //===========================================================================
  // GET REQUESTS
  //===========================================================================

  // route to verify user
  app.get('/api/verify', (req, res) => {
    if(req.user.category === "Admin") {
      res.send("Admin");
    }
    else {
      // if(req.isAuthenticated()) {
      if(true) { //replace later with isAuth
        const token = jwt.sign({user: "LoggedIn"}, "Sandwich");
        res.send(token);
      } else {
        res.send(false);
      }
    };
  });

  // route to return a list of all users
  app.get("/api/user", function(req, res) {
    db.User.findAll({ }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  //===========================================================================
  // POST REQUESTS
  //===========================================================================

  // route to authenticate user logging in
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      req.login(user, (err) => {
        if(err) {
          return err;
        }
        return res.send(user);
      })
    })(req, res, next);
  });

  	// route to POST a new user
	app.post("/api/register", function(req, res) {
    db.User.create({
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      icon: "Default",
      password: req.body.password,
      namespace: req.body.namespace,
  })
    .then(function() {
      res.sendStatus(200);
    })
    .catch(function(err) {
      res.json(err.errors[0].message);
      // res.status(401);
    });
  });
};