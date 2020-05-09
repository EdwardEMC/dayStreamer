const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();

// Socket Io set up
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Authentication for site
const session = require("express-session");
const passport = require("./config/passport");

// Requiring our models for syncing
const db = require("./models");

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

// Area to handle user pool


// Socket.io configuration
io.on('connection', function(socket){

});

// Define API routes here
require("./routes/api-routes.js")(app);

// Send every other request to the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Sync the database and start server listening on PORT
db.sequelize.sync().then(function() {
  server.listen(PORT, function() {
    console.log("App listening on http://localhost:" + PORT);
  });
});