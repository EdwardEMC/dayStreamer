import React from "react";
import "./style.css";

const userPath = process.env.PUBLIC_URL + '/assets/UserIcons/';

function DashProfile(props) {
  if(typeof props.user.username !== "undefined") {
    return (
      <div className="row">
        <div className="col-lg-6 text-center">
          <img className="img-fluid profile-pic" src={userPath + props.user.icon + ".png"} alt="profile pic" />
        </div>
        <div className="col-lg-6">
          <div className="main-info">
            <h5 className="user-info">Name: {props.user.name}</h5>
            <br></br>
            <h5 className="user-info">Email: {props.user.email}</h5>
            <br></br>
            <h5 className="user-info">Namespace: {props.user.namespace || "N/A"}</h5>
          </div>
        </div>
      </div>
    );
  }
  else {
    return <h5>Loading......</h5>
  }
};

export default DashProfile;