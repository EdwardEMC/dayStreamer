const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();

const compression = require("compression");
const path = require("path");

// Socket Io set up
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Authentication for site
const session = require("express-session");
const passport = require("./config/passport");

// Requiring our models for syncing
const db = require("./models");

// Minimise the size
app.use(compression());

// Setting up the authentication
app.use(session({ 
  secret: "keyboard user", 
  resave: true, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Socket.io configuration
require("./socket/socketOptions.js")(io);

// Define API routes here
require("./routes/api-routes.js")(app);

// Send every other request to the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

db.sequelize.sync().then(function() {
  server.listen(PORT, function() {
    console.log("App listening on http://localhost:" + PORT);
  });
});