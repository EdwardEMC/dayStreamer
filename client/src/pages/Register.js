import React, { Component } from "react";
import Card from "../components/utils/card";
import RegisterForm from "../components/RegisterForm";
import "../style.css";

class Register extends Component {
  render() {
    return (
      <div id="profile">
        <Card title="Register" insert={<RegisterForm />} />
      </div>
    );
  };
};

export default Register;