import React, { Component } from "react";
import API from "../utils/API";
import { Link } from "react-router-dom";
import "./style.css";

class RegistrationForm extends Component {
  // Setting the component's initial state
  state = {
    username: "",
    name: "",
    email: "",
    password: "",
    namespace: ""
  };

  handleInputChange = event => {
    // Getting the value and name of the input which triggered the change
    let value = event.target.value;
    const name = event.target.name;

    if (name === "password") {
      value = value.substring(0, 15);
    }
    // Updating the input's state on input
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = e => {
    e.preventDefault();

    // API call to register user
    const data = {
      username: this.state.username,
      email: this.state.email,
      name: this.state.name,
      password: this.state.password,
      namespace: this.state.namespace
    };
  
    API.newUser(data)
    .then(result => {
      if(result.data === "user.userName must be unique") {
        document.getElementById("usernameInUse").innerHTML = "Username already in use";
      }
      else if(result.data === "user.email must be unique") {
        document.getElementById("emailInUse").innerHTML = "Email already in use";
      }
      else {
        window.location.href = "/";
      }
    })
    .catch(err => console.log(err));     

    // Clears the state for the next submission
    this.setState({
      userName: "",
      name: "",
      email: "",
      password: "",
      namespace: ""
    });
  };

  render() {
    return (
      <div className="text-center">
        <form className="form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <br></br>
            <input
              className="registration"
              id="username"
              value={this.state.username}
              name="username"
              onChange={this.handleInputChange}
              type="text"
              placeholder="Jonny"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <br></br>
            <input
              className="registration"
              id="name"
              value={this.state.name}
              name="name"
              onChange={this.handleInputChange}
              type="text"
              placeholder="John Smith"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <br></br>
            <input
              className="registration"
              id="email"
              value={this.state.email}
              name="email"
              onChange={this.handleInputChange}
              type="text"
              placeholder="john@gmail.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <br></br> 
            <input
              className="registration"
              id="password"
              value={this.state.password}
              name="password"
              onChange={this.handleInputChange}
              type="password"
              placeholder="********"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="namespace">Namespace</label>
            <br></br>
            <input
              className="registration"
              id="namespace"
              value={this.state.namespace}
              name="namespace"
              onChange={this.handleInputChange}
              type="company namespace"
              placeholder="Optional..."
            />
          </div>
          <button onClick={this.handleFormSubmit}>Submit</button>
        </form>
        <br></br>
        <Link to="/">
          Login
        </Link>
      </div>
    );
  };
};

export default RegistrationForm;