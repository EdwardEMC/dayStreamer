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

const NavRoutes = () => {
  return (
    <div>
      <Header />
      <div>
        <Route exact path="/map" component={Map} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/chat" component={Chat} />
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