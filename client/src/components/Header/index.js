import React from "react";
import { Link } from "react-router-dom";
import API from "../utils/API";
import "./style.css";

function Header() {
  function logout() {
    API.logOut()
    .then(function() {
      // using href instead of history as href will refresh the page and disconnect any sockets automatically
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("User");
      window.location.href="/";
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <button id="nav-title" className="navbar-brand">DS</button>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to="/chat" className="nav-link">
              Messenger
            </Link>
          </li>
          &emsp;
          <li className="nav-item">
            <Link to="/map-type/online" className="nav-link">
              GoOnline
            </Link>
          </li>
          &emsp;
          <li className="nav-item">
            <Link to="/map-type/map" className="nav-link">
              Map
            </Link>
          </li>
          &emsp;
          <li className="nav-item">
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
          </li>
          &emsp;
          <li className="nav-item">
            <Link to="/projects" className="nav-link">
              Projects
            </Link>
          </li> 
          &emsp;
          <li className="nav-item">
            <Link to="/settings" className="nav-link">
              Settings
            </Link>
          </li>
          &emsp;
          <li className="nav-item">
            <button onClick={logout} id="logout" className="nav-link">
              Logout
            </button>
          </li>
        </ul>
        <form className="form-inline my-2 my-lg-0">
          <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"/>
          <button className="btn btn-outline-info my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
    </nav>
  );
};

export default Header;