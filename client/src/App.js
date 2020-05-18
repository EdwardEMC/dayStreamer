import React from 'react';
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// Pre login pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Site pages
import Header from "./components/Header";
import Profile from "./pages/Dashboard/Profile";
import Chat from "./pages/Dashboard/Chat";
import Settings from "./pages/Dashboard/Settings";
import Map from "./pages/Dashboard/Map";
import Plans from "./pages/Dashboard/Plans";

// Socket connection
import io from "socket.io-client";

let connected = false;
let socket;
let onlineUsers;

const NavRoutes = () => {
  const user = JSON.parse(localStorage.getItem("User"));

  // On log in connect socket (only once)
  if(!connected) {
    socket = io.connect({query: {name: user.name}});
    connected = true;
  }

  socket.on("update-user-list", data => {
    onlineUsers = data.online;
    console.log(data, "updated");
  });

  return (
    <div className="site">
      <Header />
      <div className="site-content">
        <Route exact path="/map-type/:map" component={Map} />
        <Route path="/profile" component={Profile} />
        <Route 
          exact path="/chat"
          render = {(props) => <Chat {...props} socket={socket} online={onlineUsers}/>}
        />
        <Route exact path="/plans" component={Plans} />
        <Route exact path="/settings" component={Settings} />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route component={NavRoutes} />
        {/* <AuthenticatedRoute component={NavRoutes} /> */}
      </Switch>
    </Router>
  );
};

// const AuthenticatedRoute = ({ component: Component, ...rest }) => (
//   <Route {...rest} render={props => (
//     localStorage.getItem("jwtToken") ? <Component {...props}/> : <Redirect to={{pathname: '/'}}/>
//   )}/>
// );

export default App;