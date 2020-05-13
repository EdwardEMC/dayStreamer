import React, { Component } from "react";
import API from "../utils/API";
import setAuth from "../utils/setAuth";
import { Link } from "react-router-dom";
import "./style.css";

class LoginForm extends Component {
  // Setting the component's initial state
  state = {
    email: "",
    password: ""
  };

  handleInputChange = event => {
    // Getting the value and name of the input which triggered the change
    let value = event.target.value;
    const name = event.target.name;

    if (name === "password") {
      value = value.substring(0, 15);
    }
    // Updating the input's state
    this.setState({
      [name]: value
    });
  };

  userAuth = () => {
    API.verify()
    .then(result => {
      const token = result.data
      localStorage.setItem('jwtToken', token);
      setAuth(token);
      window.location.href = "/map";
    })
    .catch(err => {
      console.log(err);
    });
  };

  handleFormSubmit = e => {
    e.preventDefault();

    // API call to login user
    API.loginCheck({
      email: this.state.email,
      password: this.state.password
    })
    .then(result => {
      if(result.data === "Incorrect password.") {
        return document.getElementById("error-msg").innerHTML = "Password Incorrect!";  
      }
      else if (result.data === "Incorrect email.") {
        return document.getElementById("error-msg").innerHTML = "Email Address Does Not Exist!";
      }
      else {
        this.userAuth();
      }
    })
    .catch(err => console.log(err));

    this.setState({
      name: "",
      email: "",
      password: ""
    });
  };

  render() {
    return (
      <div>
        <form className="form">
          <input
            value={this.state.email}
            name="email"
            onChange={this.handleInputChange}
            type="text"
            placeholder="john@gmail.com"
            required
          />
          <input
            value={this.state.password}
            name="password"
            onChange={this.handleInputChange}
            type="password"
            placeholder="********"
            required
          />
          <button onClick={this.handleFormSubmit}>Submit</button>
        </form>
        <p id="error-msg"></p>
        <Link to="/register">
          Sign Up
        </Link>
      </div>
    );
  };
};

export default LoginForm;