import React, { Component } from "react";
import Card from "../components/utils/card";
import LoginForm from "../components/LoginForm";

class Login extends Component {
  render() {
    return (
      <Card title="Login" insert={<LoginForm/>} />
    );
  };
};

export default Login;