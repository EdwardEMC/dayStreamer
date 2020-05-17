import React, { Component } from "react";
import Card from "../../components/utils/card";
import DashProfile from "../../components/Dashboard/DashProfile";
import API from "../../components/utils/API";
import "../../style.css";

class Profile extends Component {
  state = {
    user: {}
  }

  //area to render self or clicked on profile
  componentDidMount() {
    let data = "";

    const userType = window.location.href.split("/profile/");

    userType[1] ? data = userType[1] : data = "self";

    API.getUser(data)
    .then(result => {
      this.setState({user: result.data});
    })
    .catch(err => {
      console.log(err)
    });
  };

  render() {
    return (
      <div id="profile">
        <Card title={this.state.user.username} insert={<DashProfile user={this.state.user}/>}></Card> 
      </div>
    );
  };
};

export default Profile;