import React, { Component } from "react";
import RegisterForm from "../components/RegisterForm";

class Register extends Component {
  render() {
    return (
      <div className="container">
        <div className="card">
          <h2 className="text-center card-header">
            Register
          </h2>
          <div className="card-body">
            <RegisterForm />
          </div>
        </div>
      </div>
    );
  };
};

export default Register;