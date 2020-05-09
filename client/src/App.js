import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// Pre login pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Site pages
import Header from "./components/Header";
import Main from "./pages/Dashboard/Main";
import Documentation from "./pages/Dashboard/Documentation";
import Settings from "./pages/Dashboard/Settings";
import Contact from "./pages/Dashboard/Contact";

const NavRoutes = () => {
  return (
    <div>
      <Header />
      <div>
        <Route exact path="/main" component={Main} />
        <Route exact path="/documentation" component={Documentation} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/contact" component={Contact} />
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
        <AuthenticatedRoute component={NavRoutes} />
      </Switch>
    </Router>
  );
};

const AuthenticatedRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    localStorage.getItem("jwtToken") ? <Component {...props}/> : <Redirect to={{pathname: '/'}}/>
  )}/>
);

export default App;