import React, { Component } from "react";
import DashSet from "../../components/Dashboard/DashSet";
import API from "../../components/utils/API";
import Card from "../../components/utils/card";
import "../../style.css";

class Settings extends Component {
  state = {
    user: {}
  }

  componentDidMount() {
    let data = "self";

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
      <div id="profile-settings">
        <Card title="Update User" insert={<DashSet user={this.state.user}/>}></Card> 
      </div>
    );
  };
};

export default Settings;