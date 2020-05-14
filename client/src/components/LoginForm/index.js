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
      const token = result.data.token
      localStorage.setItem('jwtToken', token);
      setAuth(token);
      localStorage.setItem("User", JSON.stringify({name: result.data.user.username, id: result.data.user.id}));
      window.location.href = "/chat";
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
      <div className="text-center">
        <form className="form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <br></br>
            <input
              className="login"
              id="email"
              value={this.state.email}
              name="email"
              onChange={this.handleInputChange}
              type="text"
              placeholder="john@gmail.com"
              required
            />
          </div>
          <br></br>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <br></br>
            <input
              className="login"
              id="password"
              value={this.state.password}
              name="password"
              onChange={this.handleInputChange}
              type="password"
              placeholder="********"
              required
            />
          </div>
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