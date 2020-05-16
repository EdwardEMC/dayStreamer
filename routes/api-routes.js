const db = require("../models");
const { Op } = require("sequelize");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");

// Authentication function
const isAuth = require("../config/middleware/isAuth");
// const isReg = require("../config/middleware/isReg");

module.exports = function(app) {
  //===========================================================================
  // GET REQUESTS
  //===========================================================================
  // route to verify user
  app.get('/api/verify', (req, res) => {
    db.User.findOne({ 
      where: {
        id: req.user.id
      }
    }).then(dbUser => {
      if(req.isAuthenticated()) {
        const token = jwt.sign({user: "LoggedIn"}, "Sandwich");
        const data = {
          user: dbUser.dataValues,
          token: token
        }
        res.json(data);
      } else {
        res.send(false);
      }
    });
  });

  // route to get data about the logged in user
  app.get("/api/user/:username", isAuth, function(req, res) {
    if(req.params.username !== "self") {
      db.User.findOne({
        where: {
          username: req.params.username
        }
      })
      .then(dbUser => {
        res.json(dbUser);
      })  
      .catch(err => {
        console.log(err);
      });
    }
    else {
      db.User.findOne({
        where: {
          id: req.user.id
        }
      })
      .then(dbUser => {
        res.json(dbUser);
      })  
      .catch(err => {
        console.log(err);
      });
    };
  });

  // route to return a list of all users
  app.get("/api/all-users", function(req, res) {
    db.User.findAll({ }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  app.get("/api/chats", isAuth, function(req, res) {
    db.Chats.findAll({ 
      include: [db.Messages],
      where: {
        [Op.or]: 
          [{
            user1: req.user.username
          }, 
            {
            user2: req.user.username
          }]
      }
    }).then(function(dbChats) {
      data = {
        chats: dbChats,
        logged: req.user
      }
      res.json(data);
    })
  });

  //route to get messages from a certain chat
  app.get("/api/messages/:id", isAuth, function(req, res) {
    db.Chats.findOne({
      where: {
        chatName: req.params.id
      }
    })
    .then(function(dbChat) {
      db.Messages.findAll({
        where: {
          ChatId: dbChat.dataValues.id
        }
      })
      .then(function(dbMessages) {
        const data = {
          id: req.user.id,
          messages: dbMessages
        }
        res.json(data);
      });
    })
    .catch(function(err) {
      console.log(err);
    })
  });

   // logging out a user
   app.get("/logout", isAuth, function(req, res) {
    db.User.update({ lat: null, lng: null }, { // removes online marker
      where: {
        email: req.session.passport.user.email
      }
    })
    .then(function() {
      console.log("User logged Out");
      req.logout();
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.log(err);
    });
  });

  // route to get all markers
  app.get("/api/markers", isAuth, function(req, res) { 
    db.User.findAll({
      where: {
        lat: {
          [Op.not]: null
        }
      }
    }).then(function(dbUser) {
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

  // route to post a new chat box
  app.post("/api/user/chats", isAuth, function(req, res) {
    // alpha sort the usernames so they are always the same
    const data = [req.body.currentUser, req.user.username];
    const sortedData = data.sort().join("-");

    db.Chats.create({
      chatName: sortedData,
      user1: req.body.currentUser,
      user2: req.user.username
    })
    .then(function() {
      res.sendStatus(200);
    })
    .catch(function(err) {
      res.sendStatus(401).json(err);
    });
  });

  //route to update the message history of a chat
  app.post("/api/messages", isAuth, function(req, res) {
    db.Chats.findOne({
      where: {
        chatName: req.body.chatname
      }
    })
    .then(function(dbChat) {
      db.Messages.create({
        message: req.body.message,
        ChatId: dbChat.dataValues.id,
        UserId: req.user.id
      })
      .then(function() {
        res.status(200).end();
      })
      .catch(function(err) {
        console.log(err);
        res.status(401).json(err);
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  });

  //===========================================================================
  // POST REQUESTS
  //===========================================================================
  // route to PUT (update) a user
  app.put("/api/user", isAuth, function(req, res) {
    db.User.update({
      icon: req.body.icon,
      namespace: req.body.namespace,
      name: req.body.name
    },
    {
      where: {
        id: req.user.id
      }
    })
    .then(function() {
      console.log("Successfully updated user");
      res.status(200).end();
    })
    .catch(function(err) {
      res.status(401).json(err);
    });
  });
  
  // route to PUT (update) a user's online marker (lat, lng)
  app.put("/api/user/online", isAuth, function(req, res) {
    db.User.update({
      lat: req.body.lat,
      lng: req.body.lng,
    },
    {
      where: {
        id: req.user.id
      }
    })
    .then(function() {
      console.log("User is now online");
      res.status(200).end();
    })
    .catch(function(err) {
      res.status(401).json(err);
    });
  });

  //route to go offline
  app.put("/api/offline", isAuth, function(req, res) {
    db.User.update({ lat: null, lng: null }, { // removes online marker
      where: {
        id: req.user.id
      }
    })
    .then(function() {
      res.send("User has gone offline");
    })
    .catch(function(err) {
      res.status(401).json(err);
    });
  });

  //===========================================================================
  // DELETE REQUESTS
  //===========================================================================
  // Route to delete a user
  app.delete("/api/user", isAuth, function(req, res) {
    var id = req.user.id;
    db.User.destroy({
      where: {
        id: id
      }
    }).then(function(dbUser) {
      res.json(dbUser);
    });
  });
};