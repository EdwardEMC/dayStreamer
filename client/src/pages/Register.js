import React, { Component } from "react";
import Card from "../components/utils/card";
import RegisterForm from "../components/RegisterForm";

class Register extends Component {
  render() {
    return (
      <Card title="Register" insert={<RegisterForm />} />
    );
  };
};

export default Register;