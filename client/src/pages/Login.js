import React, { Component } from "react";
import Card from "../components/utils/card";
import LoginForm from "../components/LoginForm";
import "./style.css";

class Login extends Component {
  render() {
    return (
      <div id="profile">
        <Card title="Login" insert={<LoginForm/>} />
      </div>
    );
  };
};

export default Login;