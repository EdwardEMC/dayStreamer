import React, { Component } from "react";
import LoginForm from "../components/LoginForm";

class Login extends Component {
  render() {
    return (
      <div className="container">
        <div className="card">
          <h2 className="text-center card-header">
            Login
          </h2>
          <div className="card-body">
            <LoginForm />
          </div>
        </div>
      </div>
    );
  };
};

export default Login;